#!/bin/bash

# Exit script on Ctrl+C
trap exit 1 INT

# Detect the current ditro
distro=$(uname)
if [ $distro == 'Linux' ]
then
    distro=$(grep '^NAME=' /etc/os-release | sed -e s/NAME=//g -e s/\"//g)
fi

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
                        sudo add-apt-repository ppa:chris-lea/node.js
                        sudo apt-get update
                        sudo apt-get install -y nodejs;;
                    Fedora)
                        sudo yum install -y nodejs npm;;
                esac;;
            redis)
                case "$distro" in
                    Ubuntu)
                        sudo add-apt-repository ppa:rwky/redis
                        sudo apt-get update
                        sudo apt-get install -y redis-server;;
                    Fedora)
                        sudo yum install -y redis;;
                esac;;
        esac
    done
    # Set caps
    case "$distro" in
        Ubuntu)
            sudo apt-get install -y libcap2-bin;;
        Fedora)
            sudo yum install -y libcap;;
    esac
    sudo setcap "cap_net_bind_service=+ep" /usr/bin/node
elif [[ $distro = "Darwin" ]]
then
    echo "==========================================="
    echo "Scrollback requires the following packages"
    echo "MySQL Server"
    echo "Git Version Control"
    echo "Node.js"
    echo "Redis Server"

    echo "The above packages (except mysql) will be installed using homebrew (http://brew.sh/)"
    echo "Looking for homebrew..."
    if [[ `which brew` = '' ]]
    then
        echo "Installing homebrew first..."
        echo "Checking homebrew dependencies..."
        if [[ `which curl` = '' ]]
        then
            echo "Please install curl first: http://curl.haxx.se/download.html"
            echo "Exiting"
            exit 1
        fi
        ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
        echo "Installed"
    fi
    echo "Installing mysql"
    brew install mysql
    echo "Installing git"
    brew install git
    echo "Installiing node.js"
    brew install node
    echo "Installing redis"
    brew install redis
else
    # We only install packages for Ubuntu, Fedora and OSX
    echo "Unsupported distro. You will need to install the dependencies manually. Continue anyway [y/n]?"
    read ans
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
sudo npm install
sudo npm install -g grunt-cli
sudo npm install -g forever

# Start the MySQL and Redis daemons
echo "Starting MySQL and Redis"
if [[ $distro = 'Darwin' ]]
then
    sudo mysqld_safe
    sudo redis-server
else
    sudo service mysqld start
    sudo service redis start
fi

# Give option to set root password for MySQL in case it has not been set
echo "Do you want to set/change MySQL root password [y/n]?"
read ans
[[ "$ans" = [Yy] ]] && mysqladmin -u root password -p

# Add scrollback databases
echo "MySQL root password is required to create the scrollback user and database. Please enter when prompted."
mysql -uroot -p < ./sql/database.sql
mysql -uscrollback -pscrollback scrollback < ./sql/tables.8.sql

# Run Grunt to generate misc files
echo "Running Grunt"
grunt
