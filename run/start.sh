#!/usr/bin/env bash

cd ./db
sequelize --env development db:migrate
cd ..
#npm run prod
npm start