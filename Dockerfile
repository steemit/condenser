FROM node:10.0 as builder

ARG SOURCE_COMMIT
ENV SOURCE_COMMIT ${SOURCE_COMMIT}
ARG DOCKER_TAG
ENV DOCKER_TAG ${DOCKER_TAG}

# yarn > npm
#RUN npm install --global yarn

RUN npm install -g yarn

WORKDIR /var/app
RUN mkdir -p /var/app
ADD package.json yarn.lock /var/app/
RUN chmod +x /usr/local/lib/node_modules/yarn/bin/yarn.js && \
    yarn install --non-interactive --frozen-lockfile

COPY . /var/app

# FIXME TODO: fix eslint warnings

#RUN mkdir tmp && \
#  npm test && \
#  ./node_modules/.bin/eslint . && \
#  npm run build

RUN mkdir tmp && \
    yarn test && yarn build

# uncomment the lines below to run it in development mode
# ENV NODE_ENV development
# CMD [ "yarn", "run", "start" ]

FROM node:10.0 as final

ARG SOURCE_COMMIT
ENV SOURCE_COMMIT ${SOURCE_COMMIT}
ARG DOCKER_TAG
ENV DOCKER_TAG ${DOCKER_TAG}
ENV PORT 8080
ENV NODE_ENV production
EXPOSE 8080

WORKDIR /var/app

RUN npm install -g yarn && chmod +x /usr/local/bin/yarn
COPY --from=builder /var/app /var/app

CMD [ "yarn", "run", "production" ]
