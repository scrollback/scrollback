match n:Room
using INDEX n:Room(id)
where n.id={id}
set n.deletedOn={deletedOn}
return n;