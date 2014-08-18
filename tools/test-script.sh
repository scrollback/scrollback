#!/bin/bash
# Get user's home directory
currdir=`cd $(dirname "${BASH_SOURCE[0]}") && pwd`
scrollbackdir="${currdir%/*}"
logfile="${scrollbackdir}/logs/test-$(date +%y%m%d%H).log"

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
# Stop the server
sudo forever stop index.js 
# Setup
npm install
#bower install
#gulp

# Restart IRC
sudo forever stop ircClient/server.js 
sudo forever start ircClient/server.js
mocha test/test.js -R xunit-file
mocha test/test.js -R html-cov > "public/s/tmp/coverage-$(date +%y%m%d).html"
node test/sendTestResults.js
sudo forever start index.js




