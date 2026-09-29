FROM python:3.12-slim
WORKDIR /app
COPY index.html app.css enhance.js analytics.js finder.js server.py data.json ./
ENV HOST=0.0.0.0 PORT=8000 DATA_DIR=/data PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "server.py"]
