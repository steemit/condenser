#!/bin/sh
curl -s https://selenium-release.storage.googleapis.com/3.9/selenium-server-standalone-3.9.1.jar > ./selenium-server-standalone.jar
curl -s https://chromedriver.storage.googleapis.com/2.36/chromedriver_linux64.zip | funzip > ./chromedriver && chmod +x ./chromedriver

