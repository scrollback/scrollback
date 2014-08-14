#!/bin/bash

# Exit script on Ctrl+C
trap exit 1 INT

# Detect the current ditro
distro=$(grep '^NAME=' /etc/os-release | sed -e s/NAME=//g -e s/\"//g)

if [[ "$distro" = "Fedora" || "$distro" = "Ubuntu" ]]; then
    # Show the list of items to install
    pkgs=($(whiptail --separate-output \
            --title "Review items" \
            --checklist "The following items will be installed." \
            --ok-button "Install" \
            --cancel-button "Skip" \
            --notags 15 40 5 \
            mysql "MySQL Server" on \
            git "GIT Version Control" on \
            nodejs "Node.js" on \
            redis "Redis Server" on 3>&1 1>&2 2>&3))

    # Update the sources list in Ubuntu
    [[ "$distro" = "Ubuntu" ]] && sudo apt-get update

    # Iterate over all the items in the array and perform operations accordingly
    for (( i = 0; i < ${#pkgs[@]} ; i++ )); do
        case "${pkgs[$i]}" in
            mysql)
                case "$distro" in
                    Ubuntu)
                        sudo apt-get install -y mysql-client mysql-server;;
                    Fedora)
                        sudo yum install -y mysql mysql-server;;
                esac;;
            git)
                case "$distro" in
                    Ubuntu)
                        sudo apt-get install -y git;;
                    Fedora)
                        sudo yum install -y git;;
                esac;;
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
                esac;;
            redis)
                case "$distro" in
                    Ubuntu)
                        sudo add-apt-repository -y ppa:rwky/redis
                        sudo apt-get update
                        sudo apt-get install -y redis-server;;
                    Fedora)
                        sudo yum install -y redis;;
                esac;;
        esac
    done
    case "$distro" in
        Ubuntu)
            sudo apt-get install -y libcap2-bin ruby;;
        Fedora)
            sudo yum install -y libcap rubygems;;
    esac
    # Set caps
    sudo setcap "cap_net_bind_service=+ep" /usr/bin/node
    # Install sass
    sudo gem install sass
else
    # We only install packages for Ubuntu and Fedora
    echo "Unsupported distro. You will need to install the dependencies manually. Continue anyway [y/n]?"
    read -n 1 ans
    [[ "$ans" = [Yy] ]] || exit 1
fi

# Set open file limits
filemax=$(( $(cat /proc/sys/fs/file-max) - 2048 ))
limitconf="/etc/security/limits.conf"
grep "$(whoami) hard nofile" "$limitconf" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
cat <<EOF | sudo tee -a "$limitconf" > /dev/null 2>&1
$(whoami) hard nofile $filemax
EOF
fi
grep "$(whoami) soft nofile" "$limitconf" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
cat <<EOF | sudo tee -a "$limitconf" > /dev/null 2>&1
$(whoami) soft nofile $filemax
EOF
fi

# Are we inside the cloned repository?
grep "\"name\": \"Scrollback\"" "../package.json" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
    # Allow cloning from a forked repository
    echo "Scrollback will be installed from the upstream repo. Enter the Github username to to change, otherwise press enter:"
    read ghuser
    [[ -z "$ghuser" ]] && ghuser="scrollback"
    git clone "https://github.com/$ghuser/scrollback.git"
    cd "scrollback/tools"
fi

# Install various dependencies for scrollback
echo "Installing dependencies..."
sudo npm install -g gulp bower forever
npm install
bower install

# Start the MySQL and Redis daemons
echo "Starting MySQL and Redis"
sudo service mysqld start
sudo service redis start

# Give option to set root password for MySQL in case it has not been set
echo "Do you want to set/change MySQL root password [y/n]?"
read -n 1 ans
[[ "$ans" = [Yy] ]] && mysqladmin -u root password -p

# Add scrollback databases
echo "MySQL root password is required to create the scrollback user and database. Please enter when prompted."
mysql -uroot -p < ./sql/database.sql
mysql -uscrollback -pscrollback scrollback < ./sql/tables.8.sql

# Add local.scrollback.io to /etc/hosts
grep -e "^[0-9]*\.[0-9]*.[0-9]*\.[0-9]*.*local\.scrollback\.io" "/etc/hosts" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
    echo "Add 'local.scrollback.io' to /etc/hosts [y/n]?"
    read -n 1 ans
    [[ "$ans" = [Yy] ]] && echo "127.0.0.1	local.scrollback.io" >> "/etc/hosts"
fi

# Copy sample myConfig.js and client-config.js files
[[ ! -f "myConfig.js" ]] && cp "myConfig.sample.js" "myConfig.js"
[[ ! -f "client-config.js" ]] && cp "client-config.sample.js" "client-config.js"

# Run Gulp to generate misc files
echo "Running Gulp"
gulp
