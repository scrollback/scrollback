#!/bin/bash
# Get user's home directory
currdir=`cd $(dirname "${BASH_SOURCE[0]}") && pwd`
basedir="${currdir%/*}"
logfile="${basedir}/logs/test-$(date +%y%m%d%H).log"
backup="${basedir}/leveldb-storage/backup-$(date +%y%m%d%H)"
data="${basedir}/leveldb-storage/data"
testing_state="${basedir}/leveldb-storage/testing-state"
leveldb_storage="${basedir}/leveldb-storage"

# Create logfile
touch "$logfile"

exec &>> "$logfile"

# Show error messages
show_err() {
    echo -e "[ERR  $(date +"%H:%M:%S")] ${1}" > "$logfile"
    exit 1
}

# Go to the scrollback directory
if [[ -d "$basedir" ]]; then
    cd "$basedir"
else
    show_err "Couldn't find directory: $basedir"
fi

# Checkout the master branch
git reset --hard
git checkout master || show_err "Failed to checkout master branch"
git pull
# Stop the server
sudo stop scrollback

# clear redis
#redis-cli FLUSHALL

# Setup
npm install

gulp

# Restart IRC
sudo restart sbirc
mocha test/test.js -R mocha-html-reporter 
mv mocha-output.html "public/s/tmp/unit-test-results-$(date +%y%m%d).html"
mocha test/test.js -R html-cov > "public/s/tmp/coverage-$(date +%y%m%d).html"
sudo start scrollback
mv mocha-output.json mocha-output-unit.json
sleep 15 # startup time
#run selenium...
cp -f "${basedir}/test/config-defaults.js" "${basedir}/test/config.js"
#mocha test/selenium/test.js -R mocha-html-reporter
#mv mocha-output.html "public/s/tmp/selenium-test-results-$(date +%y%m%d).html"
#mv mocha-output.json mocha-output-selenium.json
node test/send-test-results.js

exit 0



