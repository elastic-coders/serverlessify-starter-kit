# Node version should stay to 4 which is the one in AWS lambda
FROM mhart/alpine-node:4.3

ENV NODE_ENV production

RUN adduser -D -h /usr/app -S app
WORKDIR /usr/app

COPY dist/package.json /usr/app/package.json
RUN npm install
COPY dist /usr/app

USER app
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
