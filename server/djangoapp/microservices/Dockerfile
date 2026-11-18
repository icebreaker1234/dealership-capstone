FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p /root/nltk_data/sentiment && cp sentiment/vader_lexicon.zip /root/nltk_data/sentiment/vader_lexicon.zip
ENV FLASK_APP=app.py FLASK_RUN_HOST=0.0.0.0 FLASK_RUN_PORT=5050
EXPOSE 5050
CMD ["flask", "run"]
