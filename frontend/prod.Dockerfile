# Stage 1

FROM node:alpine as builder

RUN yarn global add serve

COPY ./package.json /app/frontend/package.json
COPY ./yarn.lock /app/frontend/yarn.lock

WORKDIR /app/frontend

RUN yarn install

COPY . /app/frontend/

RUN yarn run build

# Stage 2

FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/build /usr/share/nginx/html
