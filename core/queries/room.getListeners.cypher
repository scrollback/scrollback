match listener:Room,listening:Room,listener-[r:listens]->listening
where listening.id={topicId}
return listener;