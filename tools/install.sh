# Copyright (c) 20015-2016 "Askabt Technology"
# This file is a part of Scrollback <https://scrollback.io>
#
# Scrollback is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
# Author: Sindhu S <sindhus@live.in>
#!/usr/bin/env bash

# printf on for DEBUG!
# set -xv

# Vars for Scrollback/Env
kernel=$(uname)
declare -A sys_deps
sys_deps=(
    ['git']=$(command -v git)
    ['nodejs']=$(command -v node)
    ['redis']=$(command -v redis-server)
    ['postgres']=$(command -v psql)
    ['npm']=$(command -v npm))
declare -A app_deps
app_deps=( ['gulp']=$(command -v gulp)
    ['bower']=$(command -v bower))
application_deps=""
system_deps=""
declare -A specific_pkg_names
specific_pkg_names=(
    ['postgres']="apt-get:postgresql-9.4 apt-get:postgresql-contrib-9.4 yum:postgresql-9.4 pacman:postgresql "
    ['nodejs']="apt-get:nodejs-legacy yum:nodejs pacman:nodejs"
    ['npm']="apt-get:npm yum:npm"
    ['git']="apt-get:git yum:git pacman:git"
    ['redis']="apt-get:redis-server yum:redis pacman:redis")
ip="localhost"
port="7528"

check_root() {
    if [[ "$(whoami)" = "root" ]]; then
        printf "Run script as normal user, exiting!"
        exit 1
    fi
}

check_bash() {
    version=$(bash -c 'printf $BASH_VERSINFO')
    if [ "$version" -eq 4 ]; then
        printf "You have Bash 4.x, will continue installation :)"
    else
        printf "You don't have Bash 4.x, exiting :("
        exit 1
    fi
}

whereami() {
    if [[ -d "scrollback" ]]; then
        change_dir scrollback
        location="$(grep -s "\"name\": \"Scrollback\"," package.json)"
        if [[ "$location" ]]; then
            update_scrollback
        else
            printf "You don't have Scrollback repo!"
            change_dir ..
        fi
    else
        get_scrollback
    fi
}

change_dir(){
    cd $1
}

get_scrollback() {
    printf "Do you want to clone your fork of Scrollback?"
    printf "If yes, (within 10 seconds) enter your username:"
    read -t 10 ghuser
    [[ -z "$ghuser" ]] && ghuser="scrollback"
    printf "$(git clone --depth=1 https://github.com/$ghuser/scrollback.git)"
    printf $(chown -R scrollback:scrollback scrollback)
    printf " *** Note *** This is a shallow clone, to unshallow run 'git fetch --depth=10000000"
    change_dir scrollback
}

check_deps() {
    for each in ${!sys_deps[@]}; do
        if [[ ${sys_deps[$each]} != "" ]]; then
            unset sys_deps[$each];
        fi
    done

    for each in ${!app_deps[@]}; do
        if [[ ${app_deps[$each]} != "" ]]; then
            unset app_deps[$each];
        fi
    done

    for each in ${!sys_deps[@]}; do
        system_deps=$system_deps" "$each
    done

    for each in ${!app_deps[@]}; do
        application_deps=$application_deps" "$each
    done
}

deps_osx() {
    if [[ $(which brew) ]]; then
        printf "You are on OS X with Brew installed,"
        if [[ "$system_deps" ]]; then
            printf "Running 'brew update' and will install system dependencies..."
            printf $(brew -v update && brew -v install $system_deps)
        else
            printf "You have all system dependencies installed!"
        fi
    fi
}

postgres_sources() {
    # Both Debian and Ubuntu have /etc/os-release
    # Debian doesn't support -P of grep, Ubuntu does
    # Debian doesn't have lsb_release, Ubuntu does

    lsb=$(command -v lsb_release)
    if [[ $lsb != "" ]]; then
        info=$(lsb_release -c)
        release_name=$(printf $info | grep -oP 'Codename:.* \K\w*')
    else
        release_name=$(grep VERSION= /etc/os-release | tr -d '(' | cut -d ' ' -f 2-  | tr -d ')"')
    fi

    if [[ $release_name != "" ]]; then
        apt_source="deb http://apt.postgresql.org/pub/repos/apt/ $release_name-pgdg main"
        printf "Adding Postgres' source to your software sources list (need root user rights).."
        printf $(sudo printf $apt_source > /etc/apt/sources.list.d/pgdg.list)
        printf "Updating GPG Keys for source..."
        printf $(wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -)
    fi
}

deps_linux() {
    printf "You are on a Linux system,"
    printf "Finding your distribution type and package manager..."
    declare -A osInfo;
    osInfo=(
    ['/etc/arch-release']='pacman -Svy --noconfirm base-devel'
    ['/etc/debian_version']='apt-get update && apt-get -y install build-essential'
    ['/etc/fedora-release']='yum update && yum install -y --verbose @development-tools' )
    for each in ${!osInfo[@]}; do
        if [[ -f $each ]];then
            pkg_mgr=${osInfo[$each]}
        fi
    done

    arr0=($pkg_mgr)
    install=$pkg_mgr

    if [[ "$system_deps" ]]; then
        for dep in $system_deps; do
            for pkg in ${!specific_pkg_names[@]}; do
                if [[ $dep == $pkg ]]; then
                    for each in ${specific_pkg_names[$pkg]}; do
                        arr1=(${each//:/ })
                        if [[ "${arr1[0]}" == "${arr0[0]}" ]]; then
                            install+=" ${arr1[1]}"
                        fi
                        # For debian systems that are known not to have postgresql-9.4
                        if [[ ${arr1[0]} == "apt-get" ]]; then
                            postgres_sources
                        fi
                    done
                fi
            done
        done

        printf "Updating sources and installing dependencies with:"
        printf $install
        eval "$install"
    else
        printf "You have all system dependencies installed!"
    fi
}

install_deps() {
    if [[ ${kernel} == "Darwin" ]]; then
        deps_osx
    elif [[ ${kernel} == "Linux" ]]; then
        deps_linux
    else
        printf "Whoa! You are not on a kernel we recognise."
        printf "If you think Nodejs applications are capable of runnning on this system,"
        printf "File an issue on https://github.com/scrollback/scrollback/issues."
        exit 1
    fi
}

update_scrollback() {
    printf "Bringing your local Scrollback master branch up-to-date with upstream master..."
    printf "*** Stashing *** your local changes with 'git stash save'"
    printf "To bring back local changes later, use 'git stash apply'"
    printf $(git stash save)
    printf $(git checkout master)
    printf $(git pull --rebase origin master)
}

install_pkgs() {
    printf "Installing application dependencies for Scrollback..."
    npm_base="npm install --verbose"
    npm_global="sudo $npm_base -g $application_deps"
    npm_command="$npm_base"

    # Directory is writable, no need to use root rights
    if [[ -w /usr/local/bin/ && -w /usr/local/lib/ ]]; then
        printf "Writable"
    else
        npm_command="sudo $npm_base"
    fi
    eval $npm_command

    if [[ "$application_deps" ]]; then
        eval $npm_global
    fi

    printf $(bower install --verbose)
    printf $(gulp)
}

create_config() {
	# Client config
    $(echo "module.exports = {};" > client-config.js)
}

redis() {
    redis_pid=$(pgrep redis-server)
    if [[ "$redis_pid" ]]; then
        printf "Looks like you are already running redis-server with PID $redis_pid"
    else
        printf "Starting Redis Server..."
        $(redis-server > /dev/null)
    fi
}

service_manager() {
    init_location=$(type init)
    sysvinit="init is /sbin/init"
    systemd="init is /usr/sbin/init"
    if [[ $init_location == $sysvinit ]]; then
        printf sysvinit
    else
        printf systemd
    fi
}

postgres_osx_start() {
    # Known issue of missing dirs in OS X 10.10: Stackoverflow #25970132
    printf $(mkdir -p /usr/local/var/postgres/{pg_tblspc,pg_twophase,pg_stat_tmp}/)
    printf "Starting Postgres Server..."
    printf $(pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start)
    printf "You can shutdown Postgres later with 'pg_ctl -D /usr/local/var/postgres stop -s -m fast'"
}

postgres_schemas() {
    printf "Creating tables in databases..."
    printf $(psql -U scrollback -d scrollback -a -f tools/pg/sbcontent.sql)
    printf $(psql -U scrollback -d scrollback -a -f tools/pg/sbentity.sql)
    printf $(psql -U scrollback -d logs -a -f tools/pg/logs.sql)
}

postgres_osx_create() {
    printf "Creating DB user and Scrollback DBs..."
    printf $(createuser -d scrollback)
    printf $(createdb -U scrollback -O scrollback scrollback)
    printf $(createdb -U scrollback -O scrollback logs)
}

postgres_create_linux() {
    printf("Creating DB user and Scrollback DBs...")
    printf $(sudo -u postgres createuser -d scrollback)
    printf $(sudo -u postgres createdb -O scrollback scrollback)
    printf $(sudo -u postgres createdb -O scrollback logs)
}

postgres_sysvinit() {
    printf "Starting Postgres Server..."
    $(sudo /etc/init.d/postgresql start)
    printf "To stop Postgres Server later, use 'sudo /etc/init.d/postgresql stop'"
}

postgres_systemd() {
    printf "Enabling Postgres Server.."
    $(sudo systemctl enable postgresql.service)
    printf "Starting Postgres Server..."
    $(sudo systemctl start postgresql.service)
    printf "To stop Postgres Server later, use 'sudo systemctl postgres stop'"
}

postgres() {
    printf "Checking for Postgres..."
    postgres_pids=$(pgrep postgres)
    if [[ "$postgres_pids" ]]; then
        printf "You are running Postgres server on $postgres_pids"
    else
        printf "Creating Scrollback DBs Postgres config file:"
        $(echo "localhost:5432:scrollback:scrollback:scrollback" > ~/.pgpass)
        $(echo "localhost:5432:logs:scrollback:scrollback" >> ~/.pgpass)
        $(chmod 0600 ~/.pgpass)
        if [[ ${kernel} == "Darwin" ]]; then
            postgres_osx_start
            postgres_osx_create
            postgres_schemas
        elif [[ ${kernel} == "Linux" ]]; then
            if [[ $service_manager == "sysvinit" ]]; then
                postgres_sysvinit
            elif [[ $service_manager == "systemd" ]]; then
                postgres_systemd
            fi
            postgres_create_linux
            postgres_schemas
        fi
    fi
}

run() {
    printf "Starting Scrollback, open your browser at http://$ip:$port, "
    printf $(node index.js)
}

main() {
    printf " ********** BEGIN Scrollback.io INSTALL ********** "
    # Listen to Ctrl+C
    trap exit 1 INT

    # Don't run as root
    # check_root

    # Have bash 4.x?
    check_bash

    # Have Scrollback?
    whereami

    # Check for installed deps
    check_deps

    # System deps
    install_deps

    # Application deps
    install_pkgs
    create_config

    # Run redis
    redis

    # Run/setup postgres
    postgres

    # Run Scrollback
    run

    printf " ********** END Scrollback.io INSTALL ********** "
}

main