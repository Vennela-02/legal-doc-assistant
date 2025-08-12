# main.py

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse,StreamingResponse
from chat_history import update_chat_history, get_chat_context
from file_handler import extract_text_from_file
from build_vector_store import build_and_save_index
from test_search import search_similar_chunks
from gemini_setup import stream_answer
from prompt_utils import format_prompt
from question_utils import is_summary_question
from chat_history import clear_chat_history


import faiss
import pickle
import app_state

app = FastAPI()

# ✅ Enable CORS (use origin restriction in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Legal AI Assistant running!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        print(f"📁 Upload received: {file.filename}")
        content = await file.read()
        print(" File content read.")

        page_chunks = extract_text_from_file(file.filename, content)
        build_and_save_index(page_chunks) 

        app_state.current_index = faiss.read_index("legal_index.faiss")
        with open("legal_chunks.pkl", "rb") as f:
            app_state.current_chunks = pickle.load(f)

        print(f" Reloaded index with {len(app_state.current_chunks)} chunks.")

        clear_chat_history()  # Make sure this runs before returning

        return {"message": f" Document '{file.filename}' uploaded and processed."}

    except Exception as e:
        print("❌ Error during upload:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})



@app.post("/ask")
async def ask_question(question: str = Form(...)):
    try:
        print(f"📨 Question received: {question}")

        #  Check for loaded memory
        if app_state.current_index is None or not app_state.current_chunks:
            print("❌ No index or chunks in memory.")
            return {"answer": "⚠️ No document uploaded yet. Please upload a legal document before asking questions."}

        # #  Handle summary request
        # if is_summary_question(question):
        #     if not app_state.current_chunks:
        #         return {"answer": "⚠️ No content available to summarize."}
        #     full_text = "\n".join(chunk["text"] for chunk in app_state.current_chunks)  

        #     prompt = f"You are a legal assistant. Summarize the following legal document:\n\n{full_text}\n\nSummary:"
        #     return StreamingResponse(stream_answer(prompt), media_type="text/plain")

        # Perform semantic search
        top_chunks, similarity_score = search_similar_chunks(question)
        print(f"🔍 Similarity score: {similarity_score:.2f}")

        #  Get prior conversation context (for follow-up questions)
        history_context = get_chat_context()

        # If match is strong → RAG response
        if similarity_score >= 0.15:
            context_parts = []
            for chunk in top_chunks:
                 meta = f"[Source: {chunk['source']} - Page {chunk['page']}]"
                 context_parts.append(f"{meta}\n{chunk['text']}")
            context = "\n\n".join(context_parts)
            
            prompt = format_prompt(context, question, history_context)
            update_chat_history(question)  # Add user's new question to chat history
            print("🧠 Final Prompt Preview:\n", prompt)
            return StreamingResponse(stream_answer(prompt), media_type="text/plain")

        #  If no good match, fallback to Gemini's legal knowledge
        fallback_prompt = (
            f"{history_context}\n\n"
            f"The user asked a legal question not clearly covered in the uploaded document:\n"
            f"{question}\n\n"
            "Please answer using only general legal knowledge and do not guess."
        )
        update_chat_history(question)
        return StreamingResponse(stream_answer(fallback_prompt), media_type="text/plain")

    except Exception as e:
        print("❌ Error during question handling:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})



