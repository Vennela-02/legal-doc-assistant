from typing import List, Dict, Any, Tuple
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
import os
from models import ChunkMetadata 
from qdrant_client.models import Filter, FilterSelector
from logger import logger


def get_collection_name() -> str:
    return os.getenv("QDRANT_COLLECTION", "legal_chunks")

EMBEDDER_MODEL = "all-MiniLM-L6-v2"


# MULTI-DOCUMENT SEARCH
def search_similar_chunks(
    query: str,
    top_k: int = 10
) -> Tuple[List[Dict[str, Any]], float]:
    """
    Vector search across ALL documents.
    Returns (matched_chunks, best_score)
    """
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY")
    )
    model = SentenceTransformer(EMBEDDER_MODEL)
    query_vec = model.encode([query]).tolist()[0]

    try:
        results = client.search(
            collection_name=get_collection_name(),
            query_vector=query_vec,
            limit=top_k,
            with_payload=True
        )
    except Exception as e:
        logger.exception(f"❌ Qdrant search error: {e}")
        return [], 0.0

    chunks, scores = [], []
    for r in results:
        try:
            validated = ChunkMetadata(**(r.payload or {}))
            chunks.append(validated.dict())
            scores.append(r.score)
        except Exception as e:
            logger.exception(f"⚠️ Skipping invalid payload: {e}")

    return chunks, (max(scores) if scores else 0.0)


# LIST FILES FOR FRONTEND DROPDOWN
def list_files(limit: int = 5000) -> List[Dict[str, str]]:
    """
    Return unique {file_id, file_name} pairs present in Qdrant.
    """
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY")
    )

    points, _ = client.scroll(
        collection_name=get_collection_name(),
        with_payload=True,
        limit=limit
    )
    seen = {}
    for p in points:
        try:
            validated = ChunkMetadata(**(p.payload or {}))
            if validated.file_id not in seen:
                seen[validated.file_id] = validated.file_name
        except Exception as e:
            logger.exception(f"⚠️ Skipping invalid payload: {e}")

    return [{"file_id": fid, "file_name": name} for fid, name in seen.items()]


# DELETE BY FILE NAME
def delete_file_chunks(file_name: str) -> None:
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY")
    )
    result = client.delete(
        collection_name=get_collection_name(),
        points_selector=FilterSelector(
            filter=Filter(
                must=[FieldCondition(key="file_name", match=MatchValue(value=file_name))]
            )
        ),
        wait=True
    )
    logger.info(f"🗑️ Delete result: {result}")