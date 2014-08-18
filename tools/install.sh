#!/bin/bash

# Exit script on Ctrl+C
trap exit 1 INT

# Don't run as root
if [[ "$(whoami)" = "root" ]]; then
    echo "Please run the script as normal user"
    exit 1
fi

# Detect the current distro
distro=$(grep '^NAME=' /etc/os-release | sed -e s/NAME=//g -e s/\"//g)

[[ "$distro" = "Antergos" || "$distro" = "Manjaro" ]] && distro="Arch"

if [[ "$distro" = "Fedora" || "$distro" = "Ubuntu" || "$distro" = "Arch" ]]; then
    # Show the list of items to install
    pkgs=($(whiptail --separate-output \
            --title "Review items" \
            --checklist "The following items will be installed." \
            --ok-button "Install" \
            --cancel-button "Skip" \
            --notags 15 40 5 \
            git "GIT version control" on \
            sass "Sass preprocessor" on \
            nodejs "Node.js" on \
            redis "Redis server" on \
            libcap "Constrain capability" on 3>&1 1>&2 2>&3))

    # Update the sources list in Ubuntu
    [[ "$distro" = "Ubuntu" ]] && sudo apt-get update

    # Iterate over all the items in the array and perform operations accordingly
    for (( i = 0; i < ${#pkgs[@]} ; i++ )); do
        case "${pkgs[$i]}" in
            git)
                case "$distro" in
                    Ubuntu)
                        sudo apt-get install -y git;;
                    Fedora)
                        sudo yum install -y git;;
                    Arch)
                        sudo pacman -S --needed --noconfirm git;;
                esac;;
            sass)
                case "$distro" in
                    Ubuntu)
                        sudo apt-get install -y ruby;;
                    Fedora)
                        sudo yum install -y rubygems;;
                    Arch)
                        sudo pacman -S --needed --noconfirm ruby;;
                esac
                # Add the gem installation directory to path
                grep ".gem/ruby" "${HOME}/.bashrc" > /dev/null 2>&1
                [[ $? -eq 0 ]] || echo PATH="\"\$(ruby -rubygems -e 'puts Gem.user_dir')/bin:\${PATH}\"" >> "${HOME}/.bashrc"
                # Install sass
                gem install sass;;
            nodejs)
                case "$distro" in
                    Ubuntu)
                        if [[ "$(lsb_release -sr)" < "14.04" ]]; then
                            sudo add-apt-repository -y ppa:chris-lea/node.js
                            sudo apt-get update
                            sudo apt-get install -y nodejs
                        else
                            sudo apt-get install -y nodejs-legacy npm
                        fi;;
                    Fedora)
                        sudo yum install -y nodejs npm;;
                    Arch)
                        sudo pacman -S --needed --noconfirm nodejs;;
                esac;;
            redis)
                case "$distro" in
                    Ubuntu)
                        sudo add-apt-repository -y ppa:rwky/redis
                        sudo apt-get update
                        sudo apt-get install -y redis-server;;
                    Fedora)
                        sudo yum install -y redis;;
                    Arch)
                        sudo pacman -S --needed --noconfirm redis;;
                esac;;
            libcap)
                case "$distro" in
                    Ubuntu)
                        sudo apt-get install -y libcap2-bin;;
                    Fedora)
                        sudo yum install -y libcap;;
                    Arch)
                        sudo pacman -S --needed --noconfirm libcap;;
                esac
                # Set caps
                sudo setcap "cap_net_bind_service=+ep" "$(readlink -f /usr/bin/node)";;
        esac
    done
else
    # We only install packages for Ubuntu, Fedora and Arch
    echo "Unsupported distro. You will need to install the dependencies manually. Continue anyway [y/n]?"
    read -n 1 ans
    [[ "$ans" = [Yy] ]] || exit 1
fi

# Set open file limits
filemax=$(( $(cat /proc/sys/fs/file-max) - 2048 ))
limitconf="/etc/security/limits.conf"
grep "$(whoami) hard nofile" "$limitconf" > /dev/null 2>&1
[[ $? -eq 0 ]] || echo "$(whoami) hard nofile $filemax" | sudo tee -a "$limitconf"
grep "$(whoami) soft nofile" "$limitconf" > /dev/null 2>&1
[[ $? -eq 0 ]] || echo "$(whoami) soft nofile $filemax" | sudo tee -a "$limitconf"

# Are we inside the cloned repository?
grep "\"name\": \"Scrollback\"" "package.json" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
    # Allow cloning from a forked repository
    echo "Scrollback will be installed from the upstream repo. Enter the Github username to to change, otherwise press enter:"
    read -t 10 ghuser
    [[ -z "$ghuser" ]] && ghuser="scrollback"
    git clone "https://github.com/$ghuser/scrollback.git" && cd "scrollback"
fi

# Temporarily set python version (needed by leveldb)
export PYTHON="python2.7"

# Install various dependencies for scrollback
echo "Installing dependencies..."
sudo npm install -g gulp bower forever
npm install
bower install

# Enable and start the Redis daemon
echo "Starting Redis"
if [[ `command -v service` ]]; then
    sudo service redis start
else if [[ `command -v systemctl` ]]; then
    sudo systemctl enable redis
    sudo systemctl start redis
fi

# Add local.scrollback.io to /etc/hosts
grep "local.scrollback.io" "/etc/hosts" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
    echo "Add 'local.scrollback.io' to /etc/hosts [y/n]?"
    read -t 5 -n 1 ans
    [[ -z "$ans" || "$ans" = [Yy] ]] && echo "127.0.0.1	local.scrollback.io" | sudo tee -a "/etc/hosts"
fi

# Copy sample myConfig.js and client-config.js files
[[ -f "myConfig.js" ]] || cp "myConfig.sample.js" "myConfig.js"
[[ -f "client-config.js" ]] || cp "client-config.sample.js" "client-config.js"

# Run Gulp to generate misc files
echo "Running Gulp"
gulp

# Show notification when installation finishes
[[ `command -v notify-send` ]] && notify-send "Scrollback installation finished." "Start scrollback with 'sudo npm start'."
