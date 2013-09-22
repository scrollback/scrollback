#!/bin/sh
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
while true; do
    read -p "Do you wish to install MySQL? " yn
    case $yn in
        [Yy]* ) sudo apt-get install mysql-server mysql-client; break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done
while true; do
    read -p "Do you wish to install git? " yn
    case $yn in
        [Yy]* ) sudo apt-get install git; break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done

while true; do
    read -p "Do you wish to install Nodejs? " yn
    case $yn in
        [Yy]* ) sudo apt-get install nodejs; break;;
        [Nn]* ) break;;
        * ) echo "Please answer yes or no.";;
    esac
done

read -p "Enter Github username to install scrollback from (default is scrollback): " GHUSER

#echo "$GHUSER" = "$v" ;

if [ ! "$GHUSER" ];then
   GHUSER="scrollback";
fi
            
echo $GHUSER;

cd ~
git clone https://github.com/$GHUSER/scrollback.git
cd scrollback/tools
./install.sh
