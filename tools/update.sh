#!/bin/sh

show_info() {
echo -e "\033[1;34m$@\033[0m" 1>&2 2>&1
return 0
}

show_err() {
echo -e "\033[1;31m$@\033[0m" 1>&2
return 1
}

on_err() {
show_err "An error occured while ${1}. Abort?"
read ans
if [[ "$ans" == [Yy] ]]; then
    exit 1
fi
}

# Exit script on Ctrl+C
trap exit 1 INT

# The script is irrevelant if not inside the GIT repository
grep "\"name\": \"Scrollback\"" "package.json" > /dev/null 2>&1
if [[ ! $? -eq 0 || ! -f ".git/config" ]]; then
    show_err "Not inside the GIT repository"
    on_err "checking repository"
fi

# Clean up the GIT repository
show_info "Cleaning up the GIT repository"
git checkout master || on_err "switching to master"
git reset --hard || on_err "resetting changes"
git pull || on_err "pulling latest changes"

# Create a new branch
curr=$(git branch 2>&1 | grep -o "r[0-9]*\.[0-9]*\.[0-9]*" | sort -u | tail -n 1)
currmonth=$(echo "$curr" | cut -f2 -d\.)
currrel=$(echo "$curr" | cut -f3 -d\.)
month=$(date +%m | sed 's/^0*//')
year=$(date +%y)

if [[ "$currmonth" = "$month" ]]; then
    release=$(( currrel + 1 ))
else
    release="1"
fi

branch=$(echo "r${year: -1}.${month}.${release}")

show_info "Creating release branch ${branch}"
git checkout -b "${branch}"

# Do "npm install" if there are new dependencies
show_info "Are there any new dependencies [y/n]?"
read ans
if [[ "$ans" == [Yy] ]]; then
    npm install || on_err "doing 'npm install'"
fi

# Generate files
show_info "Running grunt"
grunt || on_err "running 'grunt'"

# Restart server
show_info "Restart server [y/n]?"
read ans
if [[ "$ans" == [Yy] ]]; then
    sudo service scrollback stop
    sudo service scrollback start
fi
