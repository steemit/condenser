#!/bin/bash

# Normalize whitespace: replace 4 spaces at beginning of locale.js lines with tabs
sed -i '' -e 's/^    /	/g' *.js
