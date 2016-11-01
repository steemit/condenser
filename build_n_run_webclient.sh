#!/bin/sh
git status
echo "commit hash#"$(git rev-parse --verify HEAD)"\n\n"
echo "{\"githash\":\""$(git rev-parse --verify HEAD)"\"}" > config/last-build.json
npm install && npm run build 
if [ $(screen -ls | grep 'test_webclient' | awk '{print $1}') ]
then 
  screen -X -S $(screen -ls | grep 'test_webclient' | awk '{print $1}') quit
fi
sleep 5
screen -dmSL test_webclient npm run prod

