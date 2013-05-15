match user:Room,topic:Room
where user.id={id} and topic.id={topicid}
create user-[r:listens]->topic
return r;