#!/usr/bin/env bash
if [[ "$1" == "" ]]; then
	echo "No branch name provided"
	exit 1
fi

echo "Deploying branch $1"

echo 'cd scrollback && git fetch origin && git checkout '$1' && export NODE_ENV="development" && echo $NODE_ENV && npm install && export NODE_ENV="production" && bower install && gulp && sudo restart scrollback && tail -f logs/now.log' | ssh scrollback@sock.scrollback.io
