#!/bin/sh
git status
echo "commit hash#"$(git rev-parse --verify HEAD)"\n\n"
echo "{\"githash\":\""$(git rev-parse --verify HEAD)"\"}" >> dist/test.json
#npm install && npm run build 
if [ $(screen -ls | grep 'web' | awk '{print $1}') ]
then 
  screen -X -S $(screen -ls | grep 'web' | awk '{print $1}') quit
fi
screen -dmS webclient npm run prod

