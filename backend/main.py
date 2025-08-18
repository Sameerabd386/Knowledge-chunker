import os
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .knowledge_base import KnowledgeBase  # <-- Correct import
from pydantic import BaseModel
from dotenv import load_dotenv

# --- Cache Fix for Hugging Face Spaces / Codespaces ---
os.environ["HF_HOME"] = "/tmp/huggingface"
os.environ["TRANSFORMERS_CACHE"] = "/tmp/huggingface/transformers"
os.environ["SENTENCE_TRANSFORMERS_HOME"] = "/tmp/huggingface/sentence_transformers"

# Load environment variables from .env file
load_dotenv()

# --- Pydantic model for the request body ---
class GeminiRequest(BaseModel):
    prompt: str

app = FastAPI(title="Semantic Search API")
kb = KnowledgeBase()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEW SECURE GEMINI ENDPOINT ---
@app.post("/gemini-proxy")
async def gemini_proxy(request: GeminiRequest):
    """
    This endpoint securely calls the Gemini API from the backend.
    The API key is never exposed to the frontend.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured on the server.")

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": request.prompt}]}]}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=payload, timeout=30.0)
            response.raise_for_status()  # Raises an exception for 4XX or 5XX status codes
            return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Gemini API error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

# --- Existing Endpoints ---
@app.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".txt")):
        raise HTTPException(400, "Please upload a .pdf or .txt file.")
    try:
        file_bytes = await file.read()
        file_type = 'pdf' if file.filename.endswith(".pdf") else 'txt'
        kb.build_index(file_bytes, file_type)
        return {"filename": file.filename, "indexed_chunks": len(kb.chunks)}
    except Exception as e:
        raise HTTPException(500, f"Error processing file: {e}")

@app.get("/search/")
async def search(q: str):
    if not q:
        raise HTTPException(400, "Query 'q' cannot be empty.")
    try:
        return {"query": q, "results": kb.search(query=q, k=3)}
    except Exception as e:
        raise HTTPException(500, f"Search error: {e}")

# --- Serve Frontend ---
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

@app.get("/")
async def read_root():
    return FileResponse('../frontend/index.html')
