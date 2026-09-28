FROM python:3.12-slim
WORKDIR /app
COPY index.html enhance.js analytics.js server.py data.json ./
ENV HOST=0.0.0.0 PORT=8000 DATA_DIR=/data PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "server.py"]
