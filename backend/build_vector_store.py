from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
from chunk import chunk_text
import os
import uuid


COLLECTION_NAME = "legal_chunks"
EMBEDDER_MODEL = "all-MiniLM-L6-v2"


def file_exists(client: QdrantClient, file_name: str) -> bool:
    """
    Check if a file_name already exists in Qdrant.
    """
    results, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=Filter(
            must=[FieldCondition(key="file_name", match=MatchValue(value=file_name))]
        ),
        limit=1,
        with_payload=False
    )
    return len(results) > 0


def build_and_save_index(pages: list):
    """
    Builds Qdrant index (collection) and uploads chunks + metadata to Qdrant Cloud.
    Returns status dict: {"file_name": str, "status": "uploaded"|"skipped"}
    """
    if not pages:
        return {"file_name": None, "status": "skipped"}

    file_name = pages[0][2]  # from (text, page, source)

    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY")
    )

    # check if file already exists
    if file_exists(client, file_name):
        print(f"⚠️ Skipping upload: {file_name} already exists in Qdrant")
        return {"file_name": file_name, "status": "skipped"}

    # Convert tuples into dicts
    pages_as_dicts = [{"text": t, "page": p, "source": s} for (t, p, s) in pages]

    # Chunk the uploaded document(s)
    chunks = chunk_text(pages_as_dicts)

    # Encode using sentence-transformers
    model = SentenceTransformer(EMBEDDER_MODEL)
    embeddings = model.encode([c["text"] for c in chunks]).tolist()

    # Create collection if not exists (do not delete existing data)
    try:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=len(embeddings[0]), distance=Distance.COSINE)
        )
    except Exception:
        pass  # Collection already exists

    # Generate a unique file_id for this upload
    file_id = str(uuid.uuid4())

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "text": chunk["text"],
                "page": chunk["page"],
                "source": chunk["source"],
                "file_id": file_id,
                "file_name": chunk["source"]
            }
        )
        for chunk, embedding in zip(chunks, embeddings)
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)

    print(f"✅ Chunks uploaded for file_name={file_name}")
    return {"file_name": file_name, "status": "uploaded"}
