FROM mhart/alpine-node:4.3

ENV NODE_ENV production

RUN mkdir -p /usr/app
WORKDIR /usr/app

RUN adduser -D -h /usr/app -S -H app

COPY dist /usr/app
RUN npm install

USER app
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
