match room1:Room,room2:Room
where room1.id={fromId} and room2.id={toId}
create room1-[r:listens]->room2
return r;