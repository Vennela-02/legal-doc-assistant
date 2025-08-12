# 📜 Legal Document Assistant

A legal document chatbot powered by **Google Gemini**, **FAISS vector search**, and **Sentence Transformers** to provide answers strictly based on uploaded legal documents.  
Includes **metadata-aware retrieval** (file name + page number) for transparent and reliable answers.

---

## 🚀 Features
- 📄 **Multi-file support** (`.pdf`, `.docx`, `.pptx`, `.txt`)
- 🔍 **FAISS Vector Search** for fast document retrieval
- 🧠 **Gemini AI integration** for legal-specific Q&A
- 📑 **Source references** (file name + page number) in every answer
- 🔒 **Document type detection** to ensure only legal documents are processed

---

## 🛠 Tech Stack
- **Python 3.10+**
- **Google Gemini API** (Generative AI)
- **FAISS** (Facebook AI Similarity Search)
- **Sentence Transformers** (`all-MiniLM-L6-v2`)
- **PyMuPDF, python-docx, python-pptx** for file parsing
- **React and ShadCN** for frontend

---

## 📦 Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/legal-doc-assistant.git
   cd legal-doc-assistant
