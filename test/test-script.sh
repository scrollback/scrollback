#!/bin/bash
# Get user's home directory
currdir=`cd $(dirname "${BASH_SOURCE[0]}") && pwd`
scrollbackdir="${currdir%/*}"
logfile="${scrollbackdir}/logs/test-$(date +%y%m%d%H).log"

# Create logfile
touch "$logfile"

exec &>> "$logfile"

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
sudo stop scrollback
# Setup
npm install

gulp

# Restart IRC
sudo restart sbirc
mocha test/test.js -R mocha-html-reporter > "public/s/tmp/unit-test-results-$(date +%y%m%d).html"
mocha test/test.js -R html-cov > "public/s/tmp/coverage-$(date +%y%m%d).html"
sudo start scrollback
mv mocha-output.json mocha-output-unit.json

#run selenium...
mocha test/selenium/test.js -R mocha-html-reporter > "public/s/tmp/selenium-test-results-$(date +%y%m%d).html"
mv mocha-output.json mocha-output-selenium.json
node test/send-test-results.js

exit 0



