FROM node:17-alpine

ENV  MONGO_INITDB_ROOT_USERNAME=admin \
       MONGO_INITDB_ROOT_PASSWORD=password

RUN mkdir -p /home/app

COPY ./app /home/task-app/app
COPY ./public /home/task-app/public

CMD ["node", "/home/task-app/app/index.js"] 