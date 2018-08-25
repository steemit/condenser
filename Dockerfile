FROM node:8.7 as Base

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
RUN yarn install --non-interactive --frozen-lockfile

COPY . /var/app

RUN mkdir tmp && \
    yarn test && yarn build

ENV PORT 8080
EXPOSE 8080

## Development ##
FROM Base as Development
ENV NODE_ENV development
CMD [ "yarn", "run", "start" ]

## Production ##
FROM Base as PreProduction
RUN rm -rf .git
FROM node:8.7-alpine as Production
WORKDIR /var/app
COPY --from=PreProduction /var/app /var/app
ENV NODE_ENV production
CMD [ "yarn", "run", "production" ]
