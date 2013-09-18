ALTER TABLE `scrollback`.`accounts` ADD COLUMN `params` TEXT NULL AFTER `gateway`;
UPDATE `scrollback`.`messages` SET `from`=CONCAT('guest-', `from`);