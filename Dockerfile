FROM node:6.7

# yarn > npm
RUN npm install --global yarn

COPY . /var/app

WORKDIR /var/app

RUN yarn install

RUN mkdir tmp && \
  mv config/steem-example.json config/steem.json && \
  npm test && \
  npm run build

ENV PORT 8080
EXPOSE 8080

CMD [ "npm", "run", "prod" ]
