FROM voicevox/voicevox_engine:cpu-ubuntu20.04-latest

USER root
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /backend
COPY requirements.txt .
RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

COPY . .

RUN mkdir -p storage && chmod 777 storage

# Usamos la ruta que confirmamos en tus logs: /opt/voicevox_engine
RUN echo '#!/bin/bash\n\
echo "Iniciando motor VOICEVOX en /opt/voicevox_engine..."\n\
\n\
# Intentar arrancar con el binario "run" o con python si falla\n\
if [ -f "/opt/voicevox_engine/run" ]; then\n\
    cd /opt/voicevox_engine && ./run --host 0.0.0.0 --port 50021 &\n\
else\n\
    echo "No se encontro ./run, intentando con run.py..."\n\
    cd /opt/voicevox_engine && python3 run.py --host 0.0.0.0 --port 50021 &\n\
fi\n\
\n\
cd /backend\n\
sleep 20\n\
\n\
echo "Iniciando FastAPI..."\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 7860\n\
' > /backend/start.sh && chmod +x /backend/start.sh

EXPOSE 7860
CMD ["/backend/start.sh"]
