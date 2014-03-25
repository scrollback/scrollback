#!/bin/sh

# Exit script on Ctrl+C
trap exit 1 INT

scriptdir=$(cd .. $(dirname "${BASH_SOURCE[0]}") && pwd)

# The script is irrevelant if not inside the GIT repository
grep "\"name\": \"Scrollback\"" "../package.json" > /dev/null 2>&1
if [[ ! $? -eq 0 || ! -f "../.git/config" ]]; then
    echo "Not inside the GIT repository"
    echo "Aborting"
    exit 1
fi

# We need to stop scrollback if there are changes to the socket API
echo "Does the release have changes to the socket API [y/n]?"
read ans
[[ ans == [Yy] ]] && forever stop "$scriptdir/index.js"

# Clean up the GIT repository
echo "Cleaning up the GIT repository"
git reset --hard
git pull

# Check new dependencies
echo "Checking new dependencies"
npm install

# Generate files
echo "Running grunt"
grunt

# Restart scrollback
echo "Restarting scrollback"
forever stop "$scriptdir/index.js"
forever start "$scriptdir/index.js"