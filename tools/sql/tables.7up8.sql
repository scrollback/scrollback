/*Number of min from UTC*/
alter table accounts add timezone int default 0;/* 0 UTC*/
ALTER TABLE `rooms` ADD `temp_time` datetime ;
UPDATE scrollback.rooms SET temp_time = createdOn;
ALTER TABLE scrollback.rooms MODIFY COLUMN createdOn bigint;
UPDATE scrollback.rooms SET createdOn  = UNIX_TIMESTAMP(temp_time)*1000;
ALTER TABLE rooms drop COLUMN temp_time ;
