match listener:Room,listening:Room,listener-[r:listens]->listening
where listening.id={id}
return listener;