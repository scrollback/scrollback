#!/bin/bash
echo "Installing mysql"
sudo npm install mysql

echo "Installing uglifyjs."
sudo npm install -g uglifyjs

echo "Copying Upstart config file"
sudo cp scrollback.conf /etc/init/scrollback.conf

echo "Your MySQL root password is required to create the scrollback user and database."
echo "It will be discarded when installation is complete."
read -s -p "Your MySQL root password: " rootpass
echo ""

mysql -uroot -p$rootpass < ./sql/database.sql
mysql -uscrollback -pscrollback scrollback < ./sql/tables.2.sql
