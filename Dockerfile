# Multi-stage Dockerfile: builds React frontend and runs Flask backend (single container)

# 1) Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY public/ ./public/
COPY src/ ./src/
RUN npm ci --silent
RUN npm run build

# 2) Python runtime (backend)
FROM python:3.11-slim
WORKDIR /app

# Install system deps for any Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/
COPY init_db.py ./

# Copy frontend build into /app/build so Flask can serve it (app.py static_folder='../build')
COPY --from=frontend-build /app/build ./build

# Ensure instance directory exists
RUN mkdir -p instance

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/api/health')" || exit 1

CMD python init_db.py && gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 backend.app:app
