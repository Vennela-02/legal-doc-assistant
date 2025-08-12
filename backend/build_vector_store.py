import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from chunk import chunk_text
import os

def build_and_save_index(pages: list):
    """
    Builds FAISS index and saves both index and chunk metadata.

    Args:
        pages (list): List of (text, page_number, source) tuples.
    """
    print("📄 Starting build_and_save_index()")
    print("📂 Current working directory:", os.getcwd())

    # ✅ Convert tuples into dicts
    pages_as_dicts = [{"text": t, "page": p, "source": s} for (t, p, s) in pages]

    # Step 1: Chunk the uploaded document(s)
    chunks = chunk_text(pages_as_dicts)
    print(f"🧩 Total chunks created: {len(chunks)}")

    # Step 2: Extract raw text from chunks for embedding
    texts = [chunk["text"] for chunk in chunks]

    # Step 3: Encode using sentence-transformers
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(texts)

    # Step 4: Save to FAISS
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))

    # Step 5: Save index and chunks to disk
    faiss.write_index(index, "legal_index.faiss")
    with open("legal_chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)

    print("💾 Saved index to legal_index.faiss")
    print("💾 Saved chunks to legal_chunks.pkl")
    print("✅ Finished build_and_save_index()")
