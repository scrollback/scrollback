#!/usr/bin/env bash

branch=$(ssh ubuntu@direct.stage.scrollback.io /home/ubuntu/scrollback/tools/create-release-branch.sh)
if [[ $branch = "ERR_NOT_MASTER" ]]; then
   echo "A release branch was not created because the staging server is not running master."
   exit
fi

read -p "Release branch $branch created. Deploy to master (y/N)? " confirm
if [[ $confirm = "y" ]]; then
   ./deploy.sh $branch
else echo 'canceled'
fi
#echo new branch is: $branch
