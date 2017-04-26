#!/bin/bash

set -e

DOCKER_TAG=$TRAVIS_TAG

git clone --depth 1 --branch $DOCKER_TAG https://github.com/GolosChain/tolstoy.git tolstoy

cp -f docker/Dockerfile tolstoy/Dockerfile

cd tolstoy/
mkdir tmp/

docker build -t goloschain/tolstoy:$DOCKER_TAG .
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker push goloschain/tolstoy:$DOCKER_TAG

