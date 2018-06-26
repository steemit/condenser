#!/usr/bin/env sh

cd "$(dirname "${BASH_SOURCE[0]}")"

find _original -type f | xargs -n1 ./_processImage.sh
