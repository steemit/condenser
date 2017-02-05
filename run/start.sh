#!/usr/bin/env bash

cd ./db
sequelize --env production db:migrate
cd ..
npm run prod