#!/bin/bash
rm witness_node_data_dir.tar.gz
rm -rf witness_node_data_dir
wget http://www.steemitup.eu/witness_node_data_dir.tar.gz
tar xvf witness_node_data_dir.tar.gz
docker-compose build
docker-compose up
