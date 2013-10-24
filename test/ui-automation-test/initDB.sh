#!/bin/bash	
read -p " WARNING: This will erase all the data in the scrollback database and re-write it with new test data. Are you sure you want to continue? [y/n] " yn
while true; do
   case $yn in 
	[Yy]* ) mysql -uscrollback -pscrollback scrollback < ./initDB.sql; 
		echo "Database has been reset!" ; break;;
	[Nn]* ) break;;
	* ) echo "Invalid input, please answer [y/n]";;
   esac
done

