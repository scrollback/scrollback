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
show_err "An error occured while ${1}. Abort [y/n]?"
read -n 1 ans
printf "\n"
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
git clean -f -d || on_err "cleaning up"
git pull || on_err "pulling latest changes"

# Create a new branch
curr=$(git branch 2>&1 | sed -e 's/^[\* \t]*//' | grep -e "^r[0-9]*\.[0-9]*\.[0-9]*$" | sort -uV | tail -n 1)
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

# Create new release branch
show_info "Create new release branch '${branch}' [y/n]?"
read -n 1 ans
printf "\n"
if [[ "$ans" == [Yy] ]]; then
    git checkout -b "${branch}" || on_err "creating release branch"
fi

# Do "npm install" if there are new dependencies
show_info "Run 'npm install' [y/n]?"
read -n 1 ans
printf "\n"
if [[ "$ans" == [Yy] ]]; then
    npm install || on_err "doing 'npm install'"
fi

# Do "bower install" if there are new external libraries
show_info "Run 'bower install' [y/n]?"
read -n 1 ans
printf "\n"
if [[ "$ans" == [Yy] ]]; then
    bower install || on_err "doing 'bower install'"
fi

# Generate files
show_info "Running gulp"
gulp --production || on_err "running 'gulp'"

# Restart IRC
show_info "Restart IRC server [y/n]?"
read -n 1 ans
printf "\n"
if [[ "$ans" == [Yy] ]]; then
    sudo service irc stop || on_err "stopping irc"
    sudo service irc start || on_err "starting irc"
fi

# Restart scrollback
show_info "Restart scrollback server [y/n]?"
read -n 1 ans
printf "\n"
if [[ "$ans" == [Yy] ]]; then
    sudo service scrollback stop || on_err "stopping scrollback"
    sudo service scrollback start || on_err "starting scrollback"
fi

# Push the branch to GitHub
show_info "Push the branch to GitHub [y/n]?"
read -n 1 ans
printf "\n"
if [[ "$ans" == [Yy] ]]; then
    git push --set-upstream origin "${branch}" || on_err "pushing to GitHub"
fi
