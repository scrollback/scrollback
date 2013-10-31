CREATE TABLE scrollback.members(`user` varchar(255), room varchar(255),
	joinedOn bigint(20), partedOn bigint(20),
	PRIMARY KEY (`user`,`room`)
);
CREATE INDEX in_userId on scrollback.members(`user`);
CREATE INDEX in_roomId on scrollback.members(`room`);