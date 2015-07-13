#!/usr/bin/env bash

cd $HOME/scrollback

year=$(date +"%y") 
month=$(date +"%m")
d=$(date +"%d")
y=${year:1}
m=${month:1}
release_branch='r'$y"."$m"."$d
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ $current_branch != "master" ]; then
	echo "ERR_NOT_MASTER"
	exit
fi

npm shrinkwrap > /dev/null
git checkout -b $release_branch > /dev/null
git add npm-shrinkwrap.json > /dev/null
git commit -m "shrinkwrap added" > /dev/null
sleep 2
git push --set-upstream origin $release_branch > /dev/null 
sleep 2

echo $release_branch