match room1:Room,room2:Room
where room1.id={fromId} and room2.id={toId}
create user-[r:listens]->topic
return r;