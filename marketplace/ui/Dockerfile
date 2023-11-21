FROM node:20-bullseye as build

# RUN apt-get update 
# RUN apt-get upgrade -y 
# RUN apt-get install -y --no-install-recommends dumb-init

# ENV NODE_ENV production
ENV HOME /usr/local/app

WORKDIR ${HOME}

COPY package.json package-lock.json ./
RUN npm install
COPY . ${HOME}

RUN npm install -g @angular/cli@16.1.8
# RUN npm install

RUN npm run build


# NGINX
FROM nginx

COPY --from=build /usr/local/app/dist/flowfrenz-marketplace /usr/share/nginx/html

# USER node
EXPOSE 80

# CMD ["ng", "serve", "--omit=dev", "--host=0.0.0.0", "--disable-host-check"]
# CMD ["ng", "build"]