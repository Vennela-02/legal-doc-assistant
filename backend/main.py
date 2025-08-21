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
from fastapi import FastAPI, File, UploadFile, Form
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
    return {"message": "Legal AI Assistant API is running!"}



@app.post("/upload")
async def upload_file(files: list[UploadFile] = File(...)):
    try:
        results = []
        for file in files:
            content = await file.read()
            page_chunks = extract_text_from_file(file.filename, content)
            status = build_and_save_index(page_chunks)  
            results.append(status)

        clear_chat_history()  # reset on new upload
        return {"results": results}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# GET latest legal news
@app.get("/news")
async def get_news(query: str = "law"):
    return await fetch_legal_news(query)

# POST: scrape from URL
@app.post("/scrape")
async def scrape_from_url(url: str = Form(...)):
    result = await scrape_url(url)

    # Handle blocked/redirected sites
    if "error" in result and "Redirect" in result["error"]:
        return {
            "error": "⚠️ This site blocks web scraping. Please use a supported site or provide another source."
        }

    return result


@app.post("/ask")
async def ask_question(question: str = Form(...)):
    try:
        print(f"📨 Question received: {question}")

        # Always check available files
        files = list_files()
        print(f"📂 Files available in Qdrant: {files}")

        # Search in vector DB
        top_chunks, similarity_score = search_similar_chunks(question)
        history_context = get_chat_context()

        # Handle greetings
        greetings = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"]
        if question.strip().lower() in greetings:
            greeting_text = "Hello! How can I help you with your uploaded documents today?"
            return StreamingResponse(stream_answer(greeting_text), media_type="text/plain")

        if url_pattern.search(question):
            url = url_pattern.search(question).group(0)
            scraped = await scrape_url(url)
            if "content" in scraped:
                prompt = f"Summarize and answer based on this webpage:\n\n{scraped['content']}\n\nQuestion: {question}"
                update_chat_history(question)
                return StreamingResponse(stream_answer(prompt), media_type="text/plain")
            else:
                return JSONResponse({"error": "Failed to scrape URL"})

        # Case A: Relevant chunks found
        if top_chunks and similarity_score >= 0.10:
            context_parts = []
            for chunk in top_chunks:
                meta = f"[Source: {chunk['file_name']} - Page {chunk['page']}]"
                context_parts.append(f"{meta}\n{chunk['text']}")
            context = "\n\n".join(context_parts)

            prompt = format_prompt(context, question, history_context)
            update_chat_history(question)
            return StreamingResponse(stream_answer(prompt), media_type="text/plain")

        # Case B: Files exist but no relevant info
        if files:
            prompt = (
                f"{system_prompt}\n\n"
                f"{history_context}\n\n"
                f"The user asked:\n{question}\n\n"
                "⚠️ No direct match found in uploaded documents. This answer is based on general legal knowledge."
            )
            update_chat_history(question)
            return StreamingResponse(stream_answer(prompt), media_type="text/plain")

        # Case C: No files at all
        return JSONResponse({"message": "⚠️ No legal documents found. Please upload a document to begin."})

    except Exception as e:
        print(f"❌ Error in /ask: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})



@app.get("/files")
async def get_files():
    try:
        return list_files()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})



@app.delete("/delete/{file_name}")
async def delete_file(file_name: str):
    try:
        delete_file_chunks(file_name)
        return {"message": f"File '{file_name}' deleted successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Error deleting file: {str(e)}"})



@app.delete("/clear")
async def clear_history():
    clear_chat_history()
    return {"message": "Chat history cleared"}



