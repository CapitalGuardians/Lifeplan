FROM python:3.7-slim-stretch

COPY requirements.txt /app/ndis_calculator/requirements.txt

WORKDIR /app/ndis_calculator

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        gcc \
        python3-dev \
        mysql-client \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip \
    && pip install -r requirements.txt \
    && apt-get purge -y \
        gcc \
        python3-dev \
    && apt-get autoremove --purge -y

COPY . /app/ndis_calculator

EXPOSE 8000

CMD ./entrypoint.prod.sh
