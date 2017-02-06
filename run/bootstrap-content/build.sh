#!/usr/bin/env bash

./purge.sh
# cd ../../
# echo $(pwd)

docker build -t goloschain/webclient-tolstoy-bootstrap-content:0.1.161221 -f ./Dockerfile ../../