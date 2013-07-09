CREATE database scrollback;
CREATE USER 'scrollback'@'localhost' IDENTIFIED BY 'scrollback';
GRANT ALL ON scrollback.* TO 'scrollback'@'localhost';
