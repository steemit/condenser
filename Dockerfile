FROM node:7.5

# yarn > npm
#RUN npm install --global yarn

RUN npm install -g yarn nsp

WORKDIR /var/app
RUN mkdir -p /var/app
ADD package.json /var/app/package.json
RUN nsp check --output none
RUN yarn

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

CMD [ "yarn", "run", "production" ]

# uncomment the lines below to run it in development mode
# ENV NODE_ENV development
# CMD [ "yarn", "run", "start" ]
