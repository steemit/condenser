#!/bin/bash

set -e

DOCKER_TAG=$TRAVIS_TAG

git clone --depth 1 --branch $DOCKER_TAG https://github.com/GolosChain/tolstoy.git

cp docker/Dockerfile tolstoy/Dockerfile

cd tolstoy
mkdir tmp

sudo docker build -t goloschain/tolstoy:$DOCKER_TAG .
sudo docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
sudo docker push goloschain/tolstoy:$DOCKER_TAG

