import httpx
import trafilatura
from bs4 import BeautifulSoup

async def scrape_url(url: str):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=15)
            resp.raise_for_status()
            html = resp.text

            # First try trafilatura (best for articles)
            text = trafilatura.extract(html)
            if text:
                return {"content": text.strip()}

            # Fallback → raw BeautifulSoup
            soup = BeautifulSoup(html, "html.parser")
            paragraphs = [p.get_text() for p in soup.find_all("p")]
            return {"content": "\n".join(paragraphs)}

    except Exception as e:
        return {"error": str(e)}
