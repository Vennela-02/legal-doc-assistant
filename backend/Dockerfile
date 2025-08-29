# ---------- Base image ----------
FROM python:3.11-slim

# ---------- System dependencies ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# ---------- Set working dir ----------
WORKDIR /app

# ---------- Create venv ----------
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# ---------- Install Python deps ----------
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ---------- Copy project files ----------
COPY . .

# ---------- Expose FastAPI port ----------
EXPOSE 8000

# ---------- Run FastAPI ----------
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
