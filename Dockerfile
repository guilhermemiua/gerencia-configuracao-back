FROM node:13

WORKDIR /usr/app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install

EXPOSE 3333