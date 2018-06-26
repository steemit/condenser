#!/usr/bin/env sh

fullPath=$1
imgName=$(basename $fullPath)
fileName="${imgName%.*}"

#echo "F ${fullPath} I ${imgName} N ${fileName}"

convert -gravity center -resize 164x164^ -crop 164x164+0+0 ${fullPath} ${fileName}.jpg
convert -gravity center -resize 328x328^ -crop 328x328+0+0 ${fullPath} ${fileName}@2x.jpg

echo "File ~${fileName}~ processed"
