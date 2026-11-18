FROM node:20-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim-bookworm
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 APP=/app
WORKDIR ${APP}
COPY requirements.txt ${APP}/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . ${APP}/
COPY --from=frontend-build /build/frontend/build ${APP}/frontend/build
RUN chmod +x /app/entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "djangoproj.wsgi:application"]
