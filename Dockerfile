FROM node:7.3

# yarn > npm
#RUN npm install --global yarn

WORKDIR /var/app
RUN mkdir -p /var/app
ADD package.json /var/app/package.json
RUN npm install

COPY . /var/app

# FIXME TODO: fix eslint warnings

#RUN mkdir tmp && \
#  npm test && \
#  ./node_modules/.bin/eslint . && \
#  npm run build

RUN mkdir tmp && \
  npm test && \
  npm run-script build

ENV PORT 8080
ENV NODE_ENV production

EXPOSE 8080

CMD [ "npm", "run", "production" ]
