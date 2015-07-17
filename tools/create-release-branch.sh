#!/usr/bin/env bash

cd $HOME/scrollback

d=$(date +"%y.%-m.%d")
release_branch='r'${d:1}

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ $current_branch != "master" ]; then
	echo "ERR_NOT_MASTER"
	exit
fi

npm shrinkwrap > /dev/null
git checkout -b $release_branch > /dev/null
git add npm-shrinkwrap.json > /dev/null
git commit -m "shrinkwrap added" > /dev/null
git push --set-upstream origin $release_branch > /dev/null

echo $release_branch
