import os
import fitz  # PyMuPDF
import docx
from pptx import Presentation
from PyPDF2 import PdfReader
from typing import List, Tuple
from pdf2image import convert_from_bytes
import pytesseract

def extract_text_from_file(filename: str, content: bytes) -> List[Tuple[str, int, str]]:
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".txt":
        return extract_text_from_txt(content, filename)

    elif ext == ".pdf":
        return extract_text_from_pdf(content, filename)

    elif ext == ".docx":
        return extract_text_from_docx(content, filename)

    elif ext == ".pptx":
        return extract_text_from_pptx(content, filename)

    else:
        raise ValueError(f"Unsupported file format: {ext}")

# --- Each function returns List[(page_text, page_number, source)] ---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_with_ocr_from_bytes(content: bytes) -> List[Tuple[str, int]]:
    pages = convert_from_bytes(content, dpi=300,poppler_path=r'C:\Users\Admin\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin')
    ocr_pages = []  # <- define this list here

    for i, page_img in enumerate(pages):
        text = pytesseract.image_to_string(page_img)
        ocr_pages.append((text, i + 1))  # Append tuple (text, page number)

    return ocr_pages

def extract_text_from_pdf(content: bytes, source: str) -> List[Tuple[str, int, str]]:
    pages = []
    with fitz.open(stream=content, filetype="pdf") as doc:
        for i, page in enumerate(doc):
            pages.append((page.get_text(), i + 1, source))
     # Check total extracted text length
    total_text = "".join([p[0].strip() for p in pages])
    if len(total_text) < 100:
        print("Normal PDF extraction returned too little text; falling back to OCR...")
        # OCR extracts full text as a single string
        ocr_pages = extract_text_with_ocr_from_bytes(content)
       
        pages = [(text, page_num, source) for text, page_num in ocr_pages]
    else:
        print("Normal PDF extraction succeeded.")
    return pages

def extract_text_from_docx(content: bytes, source: str) -> List[Tuple[str, int, str]]:
    from io import BytesIO
    doc = docx.Document(BytesIO(content))
    full_text = "\n".join([para.text for para in doc.paragraphs])
    return [(full_text, 1, source)]  # Treat as one page

def extract_text_from_pptx(content: bytes, source: str) -> List[Tuple[str, int, str]]:
    from io import BytesIO
    prs = Presentation(BytesIO(content))
    pages = []
    for i, slide in enumerate(prs.slides):
        slide_text = ""
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                slide_text += shape.text + "\n"
        pages.append((slide_text.strip(), i + 1, source))
    return pages

def extract_text_from_txt(content: bytes, source: str) -> List[Tuple[str, int, str]]:
    text = content.decode("utf-8", errors="ignore")
    return [(text, 1, source)]  # Treat as one page
