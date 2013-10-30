/*
| id     | varchar(63)  | NO   | PRI |         |       |
| type   | varchar(15)  | YES  | MUL | NULL    |       |
| from   | varchar(255) | YES  | MUL | NULL    |       |
| to     | varchar(255) | YES  | MUL | NULL    |       |
| text   | text         | YES  |     | NULL    |       |
| time   | bigint(20)   | YES  | MUL | NULL    |       |
| ref    | varchar(255) | YES  | MUL | NULL    |       |
| origin | varchar(255) | YES  | MUL | NULL    |       |
| labels | varchar(255)
*/

CREATE TABLE scrollback.text_messages(
	`id` varchar(63) NOT NULL,
	`type` varchar(15),
	`from` varchar(255),
	`to` varchar(255),
	`text` text ,
	`time` bigint(20),
	`ref` varchar(255),
	`origin` varchar(255),
	`labels` varchar(255),
	PRIMARY KEY (id)
);
CREATE TABLE scrollback.nick_messages(
	`id` varchar(63) NOT NULL,
	`type` varchar(15),
	`from` varchar(255),
	`to` varchar(255),
	`text` text,
	`time` bigint(20),
	`ref` varchar(255),
	`origin` varchar(255),
	`labels` varchar(255),
	PRIMARY KEY (id)
);
CREATE TABLE scrollback.away_messages(
	`id` varchar(63) NOT NULL,
	`type` varchar(15),
	`from` varchar(255),
	`to` varchar(255),
	`text` text ,
	`time` bigint(20),
	`ref` varchar(255),
	`origin` varchar(255),
	`labels` varchar(255),
	PRIMARY KEY (id)
);
CREATE TABLE scrollback.back_messages(
	`id` varchar(63) NOT NULL,
	`type` varchar(15),
	`from` varchar(255),
	`to` varchar(255),
	`text` text ,
	`time` bigint(20),
	`ref` varchar(255),
	`origin` varchar(255),
	`labels` varchar(255),
	PRIMARY KEY (id)
);

INSERT INTO scrollback.text_messages SELECT * FROM scrollback.messages WHERE messages.type = "text";
INSERT INTO scrollback.nick_messages SELECT * FROM scrollback.messages WHERE messages.type = "nick";
INSERT INTO scrollback.away_messages SELECT * FROM scrollback.messages WHERE messages.type = "away";
INSERT INTO scrollback.back_messages SELECT * FROM scrollback.messages WHERE messages.type = "back";

ALTER TABLE `text_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `nick_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `away_messages` ADD INDEX `totime` (`to` ASC, time ASC);
ALTER TABLE `back_messages` ADD INDEX `totime` (`to` ASC, time ASC);

/*
| id          | varchar(255)  | NO   | PRI | NULL    |       |
| name        | varchar(255)  | YES  |     | NULL    |       |
| description | text          | YES  |     | NULL    |       |
| picture     | varchar(1024) | YES  |     | NULL    |       |
| profile     | varchar(1024) | YES  |     | NULL    |       |
| createdOn   | datetime      | YES  |     | NULL    |       |
| owner       | varchar(255)  | YES  |     | NULL    |       |
| type        | varchar(15)   | YES  |     | NULL    |       |
| params      | text          | YES  |     | NULL    
*/

/* Splitting rooms to make rooms and users  */

CREATE TABLE scrollback.users(
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`description` text,
	`picture` varchar(1024),
	`profile` varchar(1024),
	`createdOn` bigint,
	`owner` varchar(255),
	`type` varchar(15),
	`params` text,
	PRIMARY KEY (id)
);

INSERT INTO scrollback.users SELECT * FROM scrollback.rooms WHERE rooms.type = "user";
DELETE FROM scrollback.rooms WHERE rooms.type = "user";

ALTER TABLE `users` ADD `timezone` integer ;