#!/bin/bash
# Get user's home directory
currdir=`cd $(dirname "${BASH_SOURCE[0]}") && pwd`
scrollbackdir="${currdir%/*}"
logfile="{scrollbackdir}-$(date +%y%m%d%H)"

# Create logfile
touch "$logfile"

# Show error messages
show_err() {
    echo -e "[ERR  $(date +"%H:%M:%S")] ${1}" > "$logfile"
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
# Stop the server
forever stop index.js 
# Setup
#sudo npm install
#bower install
#gulp

# Restart IRC
forever stop ircClient/server.js 
forever start ircClient/server.js
mocha test/test.js -R xunit-file
forever start index.js




