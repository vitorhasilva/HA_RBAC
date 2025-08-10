ARG BUILD_FROM
FROM ${BUILD_FROM}

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

# Só o que precisas
RUN apk add --no-cache \
    python3 \
    tzdata \
    curl \
    jq

COPY run.sh /run.sh
COPY main.py /main.py
COPY web /web

RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
