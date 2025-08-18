import io
import faiss
import numpy as np
import PyPDF2
from sentence_transformers import SentenceTransformer
import nltk

# The download logic has been removed from here and moved to the Dockerfile.
# The application now assumes the 'punkt' model is available.

class KnowledgeBase:
    def __init__(self):
        """Initializes the KnowledgeBase with a sentence transformer model."""
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.chunks = []

    def _extract_text_from_pdf(self, pdf_file: io.BytesIO) -> str:
        """Extracts text from a PDF file."""
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text

    def _chunk_text(self, text: str) -> list[str]:
        """
        Splits text into smaller chunks.
        First by paragraphs, then splits any long paragraphs into sentences.
        """
        chunks = []
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        for paragraph in paragraphs:
            if len(paragraph) > 200:
                sentences = nltk.sent_tokenize(paragraph)
                chunks.extend(sentences)
            else:
                chunks.append(paragraph)
        
        return [chunk for chunk in chunks if chunk]


    def build_index(self, file_bytes: bytes, file_type: str):
        """Builds the FAISS index from a file."""
        if file_type == 'pdf':
            text = self._extract_text_from_pdf(io.BytesIO(file_bytes))
        elif file_type == 'txt':
            text = file_bytes.decode('utf-8')
        else:
            raise ValueError("Unsupported file type")
        
        self.chunks = self._chunk_text(text)
        if not self.chunks:
            raise ValueError("Could not extract any text chunks from the document.")

        embeddings = self.model.encode(self.chunks, show_progress_bar=True)
        embedding_dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(embedding_dim)
        self.index.add(embeddings.astype(np.float32))

    def search(self, query: str, k: int = 3) -> list[str]:
        """Searches the index for the most relevant chunks."""
        if self.index is None:
            raise RuntimeError("Index is not built. Please upload a document first.")

        query_embedding = self.model.encode([query])
        _, indices = self.index.search(query_embedding.astype(np.float32), k)
        
        return [self.chunks[i] for i in indices[0]]
