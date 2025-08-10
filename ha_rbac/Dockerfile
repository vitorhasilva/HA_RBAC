ARG BUILD_FROM
FROM ${BUILD_FROM}

# (opcional) shell mais robusto
SHELL ["/bin/ash", "-o", "pipefail", "-c"]

# Instalar bashio + python3 + utilitários
RUN apk add --no-cache \
    bashio \
    python3 \
    tzdata \
    curl \
    jq

# Copiar ficheiros
COPY run.sh /run.sh
COPY main.py /main.py
COPY web /web

# Permissões
RUN chmod a+x /run.sh

# Arranque
CMD [ "/run.sh" ]
