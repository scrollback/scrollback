/*Number of min from UTC*/
ALTER TABLE `scrollback`.`accounts` ADD COLUMN `timezone` int default 0, ADD INDEX `timezone` (`timezone`);

ALTER TABLE `rooms` ADD `temp_time` datetime ;
UPDATE scrollback.rooms SET temp_time = createdOn;
ALTER TABLE scrollback.rooms MODIFY COLUMN createdOn bigint;
UPDATE scrollback.rooms SET createdOn  = UNIX_TIMESTAMP(temp_time)*1000;
ALTER TABLE rooms drop COLUMN temp_time ;

ALTER TABLE `scrollback`.`text_messages` add index `time` (`time`), add index `fromtime` (`from`,`time`), add index `tolabeltime` (`to`,`labels`,`time`);
ALTER TABLE `scrollback`.`nick_messages` add index `fromtime` (`from`,`time`), add index `reftime` (`ref`,`time`);
ALTER TABLE `scrollback`.`away_messages` add index `fromtime` (`from`,`time`), add index `fromtotime` (`from`,`to`,`time`);
ALTER TABLE `scrollback`.`back_messages` add index `fromtime` (`from`,`time`), add index `fromtotime` (`from`,`to`,`time`);
ALTER TABLE `scrollback`.`join_messages` add index `fromtime` (`from`,`time`), add index `fromtotime` (`from`,`to`,`time`);
ALTER TABLE `scrollback`.`part_messages` add index `fromtime` (`from`,`time`), add index `fromtotime` (`from`,`to`,`time`);

ALTER TABLE `scrollback`.`rooms` add index `owner` (`owner`);
