FROM voicevox/voicevox_engine:cpu-ubuntu20.04-latest

USER root
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p storage && chmod 777 storage

# Hugging Face usa el puerto 7860
RUN echo '#!/bin/bash\n\
./run --host 0.0.0.0 --port 50021 &\n\
sleep 10\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 7860\n\
' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 7860

CMD ["/app/start.sh"]
