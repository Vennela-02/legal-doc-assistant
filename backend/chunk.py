import re

def chunk_text(pages, chunk_size=200, overlap=20):
  
    chunks = []

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

    return chunks
