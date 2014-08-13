#!/bin/bash

# Get user's home directory
currdir=`cd $(dirname "${BASH_SOURCE[0]}") && pwd`
scrollbackdir="${currdir%/*}"
logfile="/var/log/scrollback-test-$(date +%y%m%d%H)"

# Create logfile
touch "$logfile"

# Show error messages
show_err() {
echo -e "[ERR  $(date +"%H:%M:%S")] ${1}" > "$logfile"
exit 1
}

# Go to the scrollback directory
if [[ -d "$scrollbackdir" ]]; then
    cd "$scrollbackdir"
else
    show_err "Couldn't find directory: $scrollbackdir"
fi

# Checkout the master branch
git reset --hard
git checkout master || show_err "Failed to checkout master branch"
git pull

# Setup
npm install
bower install
gulp

# Stop the server
forever stop index.js

# Restart IRC
forever restart ircClient/server.js || show_err "Failed to restart IRC"
mocha test/test.js -R xunit-file



