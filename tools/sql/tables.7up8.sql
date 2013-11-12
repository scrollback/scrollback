/*Number of min from UTC*/
alter table accounts add timezone int default 0;/* 0 UTC*/
/*Add random values to current table*/
update accounts set timezone = floor(rand()*61)*24 where timezone=0;
