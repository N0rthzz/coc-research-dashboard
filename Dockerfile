FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY index.html app.css dashboard.css appearance.css enhance.js analytics.js finder.js period.js heatmap-export.js i18n.js cozy.png theme.js staff-portraits.js staff-manager.js server.py data.json ./
ENV HOST=0.0.0.0 PORT=8000 DATA_DIR=/data PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "server.py"]
