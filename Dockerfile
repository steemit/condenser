FROM node:6.7

# yarn > npm
#RUN npm install --global yarn

WORKDIR /var/app
RUN mkdir -p /var/app
ADD package.json /var/app/package.json
RUN npm install

COPY . /var/app

RUN mkdir tmp && \
  npm test && \
  ./node_modules/.bin/eslint . && \
  npm run build

ENV PORT 8080
EXPOSE 8080

CMD [ "npm", "run", "prod" ]
