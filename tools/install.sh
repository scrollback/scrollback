#!/bin/sh

sudo npm install -g uglifyjs

echo "Your MySQL root password is required to create the scrollback user and database."
echo "It will be discarded when installation is complete."
echo "Your password: "
read $rootpass

mysql -uroot -p$rootpass < ./database.sql
mysql -uscrollback -pscrollback scrollback < ./tables.sql