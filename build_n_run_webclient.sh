#!/bin/sh
npm install && npm run build && screen -dmS webclient npm run prod

