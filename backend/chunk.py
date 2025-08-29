import re
from logger import logger  # assuming logger.py exposes `logger`

def chunk_text(pages, chunk_size=200, overlap=20):
    """
    Split text into overlapping chunks while preserving metadata.
    """
    chunks = []
    try:
        for page in pages:
            text = page["text"]
            page_number = page["page"]
            source = page["source"]

            words = re.findall(r'\w+|\S', text)
            start = 0

            while start < len(words):
                end = start + chunk_size
                chunk_words = words[start:end]
                chunk_text = " ".join(chunk_words)

                chunks.append({
                    "text": chunk_text,
                    "page": page_number,
                    "source": source
                })

                start += chunk_size - overlap

        logger.info(f"✅ Chunking done: {len(chunks)} chunks created from {len(pages)} pages")

    except Exception as e:
        logger.error(f"❌ Error during chunking: {e}", exc_info=True)

    return chunks

   