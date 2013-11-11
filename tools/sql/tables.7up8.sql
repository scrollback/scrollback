/*Number of min from UTC*/
alter table accounts add timezone int;
update accounts set timezone = floor(rand()*61)*24 where timezone is null;
