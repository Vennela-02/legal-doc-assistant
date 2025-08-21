import os
import httpx
from fastapi.responses import JSONResponse

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_URL = "https://newsapi.org/v2/everything"

async def fetch_legal_news(query: str = "law", page_size: int = 5):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                NEWS_API_URL,
                params={
                    "q": query,
                    "pageSize": page_size,
                    "sortBy": "publishedAt",
                    "language": "en",
                    "apiKey": NEWS_API_KEY
                }
            )
            data = resp.json()
            if "articles" not in data:
                return {"error": "No articles found"}
            articles = [
                {"title": art["title"], "url": art["url"], "source": art["source"]["name"]}
                for art in data["articles"]
            ]
            return {"news": articles}
    except Exception as e:
        return {"error": str(e)}
