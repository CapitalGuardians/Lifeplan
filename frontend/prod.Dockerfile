FROM node:alpine

RUN yarn global add serve

COPY ./package.json /app/frontend/package.json
COPY ./yarn.lock /app/frontend/yarn.lock

WORKDIR /app/frontend

RUN yarn install

COPY . /app/frontend/

RUN yarn run build

EXPOSE 3000

CMD serve -s build -l 3000
