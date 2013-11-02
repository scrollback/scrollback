/*
modify the api for messages 
for rooms and users rollback all changes to 
*/
CREATE TABLE scrollback.text_messages(
	`id` varchar(63) NOT NULL,
	`from` varchar(255),
	`to` varchar(255),
	`text` text ,
	`time` bigint(20),
	`labels` varchar(255),
	`origin` text
);

CREATE TABLE scrollback.nick_messages(
	`id` varchar(63) NOT NULL,
	`from` varchar(255),
	`to` varchar(255),
	`time` bigint(20),
	`ref` varchar(255),
	`origin` text
);

CREATE TABLE scrollback.away_messages(
	`id` varchar(63) NOT NULL,
	`from` varchar(255),
	`to` varchar(255),
	`time` bigint(20),
	`origin` text
);

CREATE TABLE scrollback.back_messages(
	`id` varchar(63) NOT NULL,
	`from` varchar(255),
	`to` varchar(255),
	`time` bigint(20),
	`origin` text
);

CREATE TABLE scrollback.join_messages(
	`id` varchar(63) NOT NULL,
	`from` varchar(255),
	`to` varchar(255),
	`time` bigint(20),
	`origin` text
);

CREATE TABLE scrollback.part_messages(
	`id` varchar(63) NOT NULL,
	`from` varchar(255),
	`to` varchar(255),
	`time` bigint(20),
	`origin` text
);


INSERT INTO scrollback.text_messages(`id`,`from`,`to`,`text`,`time`,`origin`) 
	SELECT `id`,`from`,`to`,`text`,`time`,`origin` FROM scrollback.messages WHERE messages.type = "text";
INSERT INTO scrollback.nick_messages(`id` , `from`, `to` , `time` , `ref` , `origin`)
  SELECT `id`, `from`, `to`, `time` ,`ref` , `origin` FROM scrollback.messages WHERE messages.type = "nick";
INSERT INTO scrollback.away_messages(`id`, `from` , `to` , `time`, `origin`) 
	SELECT `id`, `from` , `to` , `time` , `origin` FROM scrollback.messages WHERE messages.type = "away";
INSERT INTO scrollback.back_messages(`id`, `from` , `to` , `time`, `origin`) 
	SELECT `id`, `from` , `to` , `time` , `origin` FROM scrollback.messages WHERE messages.type = "back";
INSERT INTO scrollback.join_messages(`id`, `from` , `to` , `time`, `origin`) 
	SELECT `id`, `from` , `to` , `time` , `origin` FROM scrollback.messages WHERE messages.type = "join";
INSERT INTO scrollback.part_messages(`id`, `from` , `to` , `time`, `origin`) 	
	SELECT `id`, `from` , `to` , `time` , `origin` FROM scrollback.messages WHERE messages.type = "part";

ALTER TABLE `text_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `nick_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `away_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `back_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `join_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `part_messages` ADD INDEX `totime` (`to` ASC, time ASC);

ALTER TABLE `text_messages` ADD PRIMARY KEY(id);
ALTER TABLE `nick_messages` ADD PRIMARY KEY(id);
ALTER TABLE `away_messages` ADD PRIMARY KEY(id);
ALTER TABLE `back_messages` ADD PRIMARY KEY(id);
ALTER TABLE `join_messages` ADD PRIMARY KEY(id);
ALTER TABLE `part_messages` ADD PRIMARY KEY(id);


-- RENAME TABLE `rooms` TO `old_rooms`;

-- CREATE TABLE scrollback.users(
-- 	`id` varchar(255) NOT NULL,
-- 	`name` varchar(255),
-- 	`picture` varchar(1024),
-- 	`homepage` varchar(1024),
-- 	`createdOn` bigint,
-- 	`timezone` int,
-- 	`params` text,
-- 	PRIMARY KEY (id)
-- );

-- CREATE TABLE scrollback.rooms(
-- 	`id` varchar(255) NOT NULL,
-- 	`name` varchar(255),
-- 	`description` text,
-- 	`picture` varchar(1024),
-- 	`homepage` varchar(1024),
-- 	`createdOn` bigint,
-- 	`timezone` int,
-- 	`params` text,
-- 	PRIMARY KEY (id)
-- )

-- INSERT INTO scrollback.users(`id`,`name`,`picture`,`profile`,`createdOn`, `timezone`,`params`) 
-- 	SELECT `id`,`name`,`picture`,`profile`,`createdOn`,0,`params` 
-- 	FROM scrollback.rooms WHERE rooms.type = "user";

-- DELETE FROM scrollback.rooms WHERE rooms.type = "user";

-- ALTER TABLE `rooms` ADD `temp_time` datetime ;

-- UPDATE scrollback.rooms SET temp_time = createdOn; 

-- ALTER TABLE scrollback.rooms MODIFY COLUMN createdOn bigint ; 

-- UPDATE scrollback.rooms SET createdOn  = UNIX_TIMESTAMP(temp_time)  ;

-- ALTER TABLE rooms drop COLUMN temp_time ;

-- CREATE TABLE scrollback.user_accounts(
-- 	`id` varchar(255),
-- 	`user` varchar(255),
-- 	`gateway` varchar(15),
-- 	`params` text,
-- 	PRIMARY KEY (id)  
-- );

-- CREATE TABLE scrollback.room_accounts(
-- 	`id` varchar(255),
-- 	`room` varchar(255),
-- 	`gateway` varchar(15),
-- 	`params` text,
-- 	PRIMARY KEY (id)	
-- );

-- INSERT INTO scrollback.user_accounts SELECT * from scrollback.accounts WHERE accounts.gateway = "mailto";
-- INSERT INTO scrollback.room_accounts SELECT * from scrollback.accounts WHERE accounts.gateway = "irc";

-- DROP TABLES messages , accounts ;
