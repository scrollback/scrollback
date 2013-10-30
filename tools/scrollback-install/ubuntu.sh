#!/bin/sh
sudo apt-get install python-software-properties
sudo add-apt-repository ppa:chris-lea/node.js
sudo add-apt-repository ppa:rwky/redis
sudo apt-get update
while true; do
    read -p "Do you wish to install MySQL [y/n]? " yn
    case $yn in
        [Yy]* ) sudo apt-get install mysql-server mysql-client; break;;
        [Nn]* ) break;;
        * ) echo "Please answer [y/n].";;
    esac
done
while true; do
    read -p "Do you wish to install git [y/n]? " yn
    case $yn in
        [Yy]* ) sudo apt-get install git; break;;
        [Nn]* ) break;;
        * ) echo "Please answer [y/n].";;
    esac
done

while true; do
    read -p "Do you wish to install Nodejs [y/n]? " yn
    case $yn in
        [Yy]* ) sudo apt-get install nodejs; break;;
        [Nn]* ) break;;
        * ) echo "Please answer [y/n].";;
    esac
done
while true; do
    read -p "Do you wish to install Redis-server [y/n]? " yn
    case $yn in
        [Yy]* ) sudo apt-get install redis-server; break;;
        [Nn]* ) break;;
        * ) echo "Please answer [y/n].";;
    esac
done

read -p "Enter Github username to install scrollback from (default is scrollback): " GHUSER

if [ ! "$GHUSER" ];then
   GHUSER="scrollback";
fi
            
echo "downloading scrollback from user:$GHUSER";

cd ~
git clone https://github.com/$GHUSER/scrollback.git
cd scrollback/tools
./install.sh
