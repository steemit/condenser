#!/bin/sh
git status
echo "commit hash#"$(git rev-parse --verify HEAD)"\n\n"
npm install && npm run build && screen -dmS webclient npm run prod

