#!/bin/bash

declare -A components

for file in $1/*.jsx
do
    name=${file##*/}
    base=${name%.jsx}
    cd ./src
    count=$(grep -r -o "<$base" | wc -l)
    components+=([$base]=$count)
    cd ../
done

for i in "${!components[@]}"
do
    echo "$i: ${components[$i]}"
done |
sort -rn -k2