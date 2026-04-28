# Cambiamos a la versión 22.04 que tiene Python 3.10
FROM voicevox/voicevox_engine:cpu-ubuntu22.04-latest

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

# En Ubuntu 22.04 el motor suele estar en /app o /opt/voicevox_engine
RUN echo '#!/bin/bash\n\
echo "Buscando el ejecutable del motor..."\n\
# Intentar encontrar la ruta real del motor\n\
REAL_PATH=$(find /opt /app -name "run" -type f -executable | head -n 1)\n\
echo "Motor encontrado en: $REAL_PATH"\n\
\n\
if [ -n "$REAL_PATH" ]; then\n\
    cd $(dirname $REAL_PATH)\n\
    ./run --host 0.0.0.0 --port 50021 &\n\
else\n\
    echo "ERROR: No se encontro el binario run"\n\
fi\n\
\n\
cd /backend\n\
sleep 25\n\
\n\
echo "Iniciando FastAPI..."\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 7860\n\
' > /backend/start.sh && chmod +x /backend/start.sh

EXPOSE 7860
CMD ["/backend/start.sh"]
