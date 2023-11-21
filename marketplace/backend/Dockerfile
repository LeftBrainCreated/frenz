FROM node:21

ENV HOME /usr/src/
WORKDIR $HOME

COPY package.json package-lock.json ./
RUN npm install
COPY . ${HOME}


RUN apt-get update 

# RUN npm install
RUN npm run build

EXPOSE 8020

CMD [ "node", "dist/index.js" ]
