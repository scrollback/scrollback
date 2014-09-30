# This bash script is used to automate the analytics queries.

# The query is run and the output is written to csv files at the specified location (or the current directory by default).
# These csv files can be used to create pivot tables for data visualization.


# Usage: ./analyticsQueries.sh [/path/to/output/folder]


#!/bin/bash

# Timeline Queries

desc[1]="texts"
query[1]="select date_trunc('day', time) as day, temp_msgs.gateway as gateway, count(*) from (select time, gateway from text_actions where time > date_trunc('month', now()) - interval '1 month') as temp_msgs group by day, gateway order by day;"

desc[2]="creations"
query[2]="select date_trunc('day', time) as day, type, count(*) from (select time, type from user_room_actions where time > date_trunc('month', now()) - interval '1 month' and creation=true) as temp_creations group by day, type order by day;"

desc[3]="visitors"
query[3]="select date_trunc('day', time) as day, gateway, count(distinct session) from (select time, gateway, session from occupant_actions where time > date_trunc('month', now()) - interval '1 month') as temp_visits group by day, gateway order by day;"


# Top N Queries

desc[4]="top-rooms"
query[4]="select text_actions.to, count(*) as c from text_actions where time > timestamp '2014-07-05 00:00' and time < timestamp '2014-07-06 00:00' group by text_actions.to order by c desc limit 10;"

desc[5]="top-rooms-gateways"
query[5]="select text_actions.to, gateway, count(*) as c from text_actions where time > timestamp '2014-07-05 00:00' and time < timestamp '2014-07-06 00:00' group by text_actions.to, gateway order by c desc limit 10;"

desc[6]="top-rooms-web"
query[6]="select text_actions.to, count(*) as c from text_actions where gateway='web' and time > timestamp '2014-07-05 00:00' and time < timestamp '2014-07-06 00:00' group by text_actions.to order by c desc limit 10;"

desc[7]="top-rooms-irc"
query[7]="select text_actions.to, count(*) as c from text_actions where gateway='irc' and time > timestamp '2014-07-05 00:00' and time < timestamp '2014-07-06 00:00' group by text_actions.to order by c desc limit 10;"

desc[8]="top-rooms-visitors"
query[8]="select occupant_actions.to, count(distinct session) as c from occupant_actions where time > timestamp '2014-09-05 20:00' and time < timestamp '2014-09-05 21:00' group by occupant_actions.to order by c desc limit 10;"


echo "Please enter the Postgresql password to continue: "
read pgpwd

path=""
if [ -n "$1" ]; then
    path=$1
else
    path="."
fi

cnt=0

for i in "${query[@]}"
do
	(( cnt++ ))
	echo
	echo "Running Query: "${desc[$cnt]}"-->"" Writing query output to: ""${desc[$cnt]}"".csv"
	echo "----------------------------------------------------------------------------------------------------"
	echo
	querystr=PGPASSWORD=$pgpwd" ""psql -U scrollback -h 23.246.213.162 -d logs -t -A -F "" \",\" "" -c ""\""$i"\""" > "$path"/"${desc[$cnt]}".csv"
#	echo $querystr
	echo
	echo
	eval $querystr
done
echo "Completed running queries ... "
echo
