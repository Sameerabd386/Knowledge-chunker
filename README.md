
---
title: Knowledge Chunker
emoji: 🤖
colorFrom: purple
colorTo: indigo
sdk: docker
---

<div align="center">
<h1>
<font color="#8B5CF6">🤖 Knowledge Chunker & Semantic Search API</font>
</h1>
<br>
<p>
<em>
A full-stack application that transforms your documents into an intelligent, searchable knowledge base using AI.
</em>
</p>
</div>

<hr>

<br>

This project allows users to upload .pdf or .txt files, which are then processed, chunked, and indexed for powerful semantic search. Users can ask questions in natural language and receive the most relevant information instantly. The application is enhanced with the Google Gemini API to provide AI-powered summaries and suggest follow-up questions, creating a dynamic and interactive way to explore documents.

<br>

<font color="#10B981">🌟 Key Features</font>
<br>

Feature

Description

📤 Document Upload

Ingests .pdf and .txt files through a clean, responsive web interface.

🔍 Semantic Search

Converts text into vector embeddings and uses a FAISS index for fast, meaning-based search.

✨ AI Summaries

Leverages the Gemini API to generate concise summaries of search results on demand.

💡 AI Question Suggestions

Generates relevant follow-up questions to guide deeper exploration of the content.

🔒 Secure API Key

Manages the Gemini API key securely on the backend, never exposing it to the client.

🎨 Responsive Frontend

A modern user interface built with React and styled with Tailwind CSS for a great experience on any device.

<br>

<font color="#3B82F6">🛠️ Tech Stack</font>
<br>

The project is built with a modern Python backend and a React frontend, utilizing the following technologies:

Backend
Framework: FastAPI

Web Server: Uvicorn

Embeddings: sentence-transformers

Vector DB: faiss-cpu

PDF Processing: PyPDF2

Text Chunking: nltk

API Calls: httpx

Secrets Management: python-dotenv

Frontend
Library: React

Styling: Tailwind CSS

Transpiler: Babel (in-browser)

<br>

<font color="#EF4444">🚀 How to Run Locally</font>
<br>

Clone the Repository:

git clone https://github.com/Sameerabd386/knowledge-chunker.git
cd knowledge-chunker

Set up the Backend:

Navigate to the backend directory: cd backend

Create and activate a virtual environment:

python3 -m venv venv
source venv/bin/activate

Install all required dependencies:

pip install -r requirements.txt

Create a .env file in the backend directory and add your secret Gemini API key:

GEMINI_API_KEY=YOUR_API_KEY_HERE

Run the development server:

uvicorn main:app --reload

Access the Application:

Open your browser and navigate to http://127.0.0.1:8000. The frontend will be served automatically.
