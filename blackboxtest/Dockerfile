FROM circleci/openjdk:jdk-node-browsers

WORKDIR /home/circleci
COPY package.json yarn.lock /home/circleci/
RUN yarn install --non-interactive --frozen-lockfile
RUN curl -s https://selenium-release.storage.googleapis.com/3.9/selenium-server-standalone-3.9.1.jar > /home/circleci/selenium-server-standalone.jar
RUN curl -s https://chromedriver.storage.googleapis.com/2.36/chromedriver_linux64.zip | funzip > /home/circleci/chromedriver && chmod +x /home/circleci/chromedriver

COPY . /home/circleci/


CMD [ "yarn", "start" ]


