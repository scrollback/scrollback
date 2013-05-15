match listener:Room,listening:Room,listener-[r:listens]->listening
where listener.id={id}
return listening;