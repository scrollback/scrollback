match n:Room
using INDEX n:Room(id)
where n.id={id}
return n;