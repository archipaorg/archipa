#!/usr/bin/env bash
# copy doc files
cp -R ./doc ./dist/doc
# copy man files
cp -R ./man ./dist/man
# copy core framework icl files
#cp -R ./src/bricks ./dist/bricks
# copy orch icl files
#find ./src/orchestrators -name 'orchestrators' -type d -exec dirname {} \; | while read f; do
# get orch name
#orchname="$(echo $f | sed 's!.*/!!')"
#mkdir ./dist/$orchname
# copy orch icl files
#cp -R $f/orch ./dist/$orchname/orch
#done

