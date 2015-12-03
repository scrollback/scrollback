#!/usr/bin/env bash
if [[ "$1" == "" ]]; then
	echo "No branch name provided"
	exit 1
fi

echo "Deploying branch $1"

echo 'cd heyneighbor && git fetch origin && git checkout '$1' && export NODE_ENV="development" && echo $NODE_ENV && npm install && export NODE_ENV="production" && bower install && gulp && sudo restart heyneighbor && tail -f logs/now.log' | ssh ssh ubuntu@52.76.69.167
