ARG VERSION=18

# First stage: build.
FROM node:${VERSION}-alpine AS build

WORKDIR /usr/src/app
COPY dashboard-app/package.json dashboard-app/package-lock.json ./
RUN apk --no-cache add py-pip make g++ curl &&\
    npm install &&\
    apk --no-cache del -r py-pip make g++

ENV PATH="./node_modules/.bin:$PATH"

COPY ./dashboard-app .
RUN npm run build

# Second stage: run.
FROM nginx:stable-alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/demo
COPY dashboard-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE $NGINX_PORT
CMD ["nginx", "-g", "daemon off;"]
