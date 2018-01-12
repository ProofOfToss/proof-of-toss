FROM node:9.3.0

ADD . /home/app

WORKDIR /home/app

RUN npm install -g solc && \
    npm install -g truffle@3.4.11

RUN npm install && \
    truffle compile
    truffle --network test migrate

CMD [ "npm", "run", "start_app" ]