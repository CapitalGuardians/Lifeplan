FROM node:alpine

COPY ./package.json /app/frontend/package.json
COPY ./yarn.lock /app/frontend/yarn.lock
RUN cd /app/frontend && \
    yarn install
WORKDIR /app/frontend

EXPOSE 3000
CMD yarn start
