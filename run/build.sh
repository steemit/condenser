#!/usr/bin/env bash

./purge.sh
# cd ../../
# echo $(pwd)

docker build -t goloschain/webclient-tolstoy:0.1.161221 .