from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from chat_history import update_chat_history, get_chat_context, clear_chat_history
from file_handler import extract_text_from_file
from build_vector_store import build_and_save_index
from retrieval import search_similar_chunks, delete_file_chunks, list_files
from gemini_setup import stream_answer
from prompt_utils import format_prompt
from legalprompt import system_prompt
from live_news import fetch_legal_news
from web_scraper import scrape_url
from logger import logger
from urllib.parse import unquote
import re

url_pattern = re.compile(r'https?://\S+')

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    logger.info("Root endpoint hit - API is running")
    return {"message": "Legal AI Assistant API is running!"}


@app.post("/upload")
async def upload_file(files: list[UploadFile] = File(...)):
    try:
        logger.info(f"📂 Upload requested for {len(files)} file(s)")
        results = []
        for file in files:
            content = await file.read()
            page_chunks = extract_text_from_file(file.filename, content)
            status = build_and_save_index(page_chunks)  
            results.append(status)
            logger.info(f"✅ File uploaded: {file.filename}, status={status}")

        clear_chat_history()
        logger.info("Chat history cleared after upload")
        return {"results": results}

    except Exception as e:
        logger.exception(f"❌ Error uploading files: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/news")
async def get_news(query: str = "law"):
    logger.info(f"Fetching news with query={query}")
    try:
        return await fetch_legal_news(query)
    except Exception as e:
        logger.exception(f"❌ Error fetching news: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/scrape")
async def scrape_from_url(url: str = Form(...)):
    logger.info(f"Scraping requested for: {url}")
    scraped = await scrape_url(url)

    if "error" in scraped:
        logger.warning(f"Scraping error for {url}: {scraped['error']}")
        if "Redirect" in scraped["error"]:
            return {"error": "This site blocks web scraping. Please use another source."}
        return scraped

    content = scraped.get("content", "")
    if not content.strip():
        logger.warning(f"No content extracted from {url}")
        return {"error": "No content extracted from the given URL."}

    page_chunks = [(content, 1, f"Web:{url}")]
    status = build_and_save_index(page_chunks)

    logger.info(f"✅ Web content stored for {url}, status={status}")
    return {
        "url": url,
        "content": content
    }


@app.post("/ask")
async def ask_question(question: str = Form(...)):
    try:
        logger.info(f"📨 Question received: {question}")

        files = list_files()
        logger.info(f"📂 Files available in Qdrant: {files}")

        top_chunks, similarity_score = search_similar_chunks(question)
        history_context = get_chat_context()

        greetings = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"]
        if question.strip().lower() in greetings:
            logger.info("Greeting detected")
            greeting_text = "Hello! How can I help you with your uploaded documents today?"
            return StreamingResponse(stream_answer(greeting_text), media_type="text/plain")

        if url_pattern.search(question):
            url = url_pattern.search(question).group(0)
            scraped = await scrape_url(url)
            if "content" in scraped:
                logger.info(f"✅ Scraped inline URL: {url}")
                prompt = f"Summarize and answer based on this webpage:\n\n{scraped['content']}\n\nQuestion: {question}"
                update_chat_history(question)
                return StreamingResponse(stream_answer(prompt), media_type="text/plain")
            else:
                logger.error(f"❌ Failed to scrape URL in question: {url}")
                return JSONResponse({"error": "Failed to scrape URL"})

        if top_chunks and similarity_score >= 0.10:
            context_parts = []
            for chunk in top_chunks:
                meta = f"[Source: {chunk['file_name']} - Page {chunk['page']}]"
                context_parts.append(f"{meta}\n{chunk['text']}")
            context = "\n\n".join(context_parts)

            prompt = format_prompt(context, question, history_context)
            update_chat_history(question)
            logger.info("✅ Answer generated from relevant chunks")
            return StreamingResponse(stream_answer(prompt), media_type="text/plain")

        if files:
            logger.warning("⚠️ Files exist but no relevant info found")
            prompt = (
                f"{system_prompt}\n\n"
                f"{history_context}\n\n"
                f"The user asked:\n{question}\n\n"
                "⚠️ No direct match found in uploaded documents. This answer is based on general legal knowledge."
            )
            update_chat_history(question)
            return StreamingResponse(stream_answer(prompt), media_type="text/plain")

        logger.warning("⚠️ No files found at all")
        return JSONResponse({"message": "⚠️ No legal documents found. Please upload a document to begin."})

    except Exception as e:
        logger.exception(f"❌ Error in /ask: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/files")
async def get_files():
    try:
        files = list_files()
        logger.info("📂 Files listed")
        return files
    except Exception as e:
        logger.exception(f"❌ Error listing files: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.delete("/delete/{file_name:path}")
async def delete_file(file_name: str):
    try:
        decoded_name = unquote(file_name)
        logger.info(f"🗑️ Deleting file: {decoded_name}")
        delete_file_chunks(decoded_name)
        return {"message": f"File '{decoded_name}' deleted successfully."}
    except Exception as e:
        logger.error(f"❌ Delete failed for {file_name}: {e}")
        return JSONResponse(status_code=500, content={"error": f"Error deleting file: {str(e)}"})


@app.delete("/clear")
async def clear_history():
    try:
        clear_chat_history()
        logger.info("✅ Chat history cleared")
        return {"message": "Chat history cleared"}
    except Exception as e:
        logger.exception(f"❌ Error clearing history: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
