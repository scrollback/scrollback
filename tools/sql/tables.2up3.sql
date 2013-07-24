ALTER TABLE `scrollback`.`messages` 
ADD INDEX `type` (`type` ASC) 
, ADD INDEX `from` (`from` ASC) 
, ADD INDEX `to` (`to` ASC) 
, ADD INDEX `time` (`time` ASC) 
, ADD INDEX `ref` (`ref` ASC) 
, ADD INDEX `origin` (`origin` ASC) ;

ALTER TABLE `scrollback`.`accounts` ADD COLUMN `params` TEXT NULL  AFTER `gateway` 
, ADD INDEX `room` (`room` ASC) 
, ADD INDEX `gateway` (`gateway` ASC) ;

ALTER TABLE `scrollback`.`rooms` ADD COLUMN `type` VARCHAR(15) NULL  AFTER `id` , ADD COLUMN `params` TEXT NULL  AFTER `owner` 
, ADD INDEX `type` (`type` ASC) 
, ADD INDEX `owner` (`owner` ASC) ;
