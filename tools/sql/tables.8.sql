SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `scrollback` DEFAULT CHARACTER SET latin1 ;
USE `scrollback` ;

-- -----------------------------------------------------
-- Table `scrollback`.`accounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`accounts` (
  `id` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL,
  `room` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `gateway` VARCHAR(15) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `params` TEXT CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `timezone` INT(11) NULL DEFAULT '0',
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `scrollback`.`away_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`away_messages` (
  `id` VARCHAR(63) NOT NULL,
  `from` VARCHAR(255) NULL DEFAULT NULL,
  `to` VARCHAR(255) NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `origin` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `totime` (`to` ASC, `time` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `scrollback`.`back_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`back_messages` (
  `id` VARCHAR(63) NOT NULL,
  `from` VARCHAR(255) NULL DEFAULT NULL,
  `to` VARCHAR(255) NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `origin` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `totime` (`to` ASC, `time` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `scrollback`.`join_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`join_messages` (
  `id` VARCHAR(63) NOT NULL,
  `from` VARCHAR(255) NULL DEFAULT NULL,
  `to` VARCHAR(255) NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `origin` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `totime` (`to` ASC, `time` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `scrollback`.`members`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`members` (
  `user` VARCHAR(255) NOT NULL DEFAULT '',
  `room` VARCHAR(255) NOT NULL DEFAULT '',
  `joinedOn` BIGINT(20) NULL DEFAULT NULL,
  `partedOn` BIGINT(20) NULL DEFAULT NULL,
  PRIMARY KEY (`user`, `room`),
  INDEX `in_userId` (`user` ASC),
  INDEX `in_roomId` (`room` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `scrollback`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`messages` (
  `id` VARCHAR(63) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL DEFAULT '',
  `type` VARCHAR(15) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `from` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `to` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `text` TEXT CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `ref` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `origin` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `labels` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `type` (`type` ASC),
  INDEX `from` (`from` ASC),
  INDEX `to` (`to` ASC),
  INDEX `time` (`time` ASC),
  INDEX `ref` (`ref` ASC),
  INDEX `origin` (`origin` ASC),
  INDEX `all` (`to` ASC, `type` ASC, `time` ASC),
  INDEX `all1` (`type` ASC, `to` ASC, `time` ASC),
  INDEX `hr` USING HASH (`to` ASC),
  INDEX `ht` USING HASH (`type` ASC),
  INDEX `hrt` USING HASH (`type` ASC, `to` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `scrollback`.`nick_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`nick_messages` (
  `id` VARCHAR(63) NOT NULL,
  `from` VARCHAR(255) NULL DEFAULT NULL,
  `to` VARCHAR(255) NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `ref` VARCHAR(255) NULL DEFAULT NULL,
  `origin` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `totime` (`to` ASC, `time` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `scrollback`.`part_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`part_messages` (
  `id` VARCHAR(63) NOT NULL,
  `from` VARCHAR(255) NULL DEFAULT NULL,
  `to` VARCHAR(255) NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `origin` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `totime` (`to` ASC, `time` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `scrollback`.`rooms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`rooms` (
  `id` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL,
  `name` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `description` TEXT CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `picture` VARCHAR(1024) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `profile` VARCHAR(1024) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `createdOn` BIGINT(20) NULL DEFAULT NULL,
  `owner` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `type` VARCHAR(15) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  `params` TEXT CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `scrollback`.`text_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `scrollback`.`text_messages` (
  `id` VARCHAR(63) NOT NULL,
  `from` VARCHAR(255) NULL DEFAULT NULL,
  `to` VARCHAR(255) NULL DEFAULT NULL,
  `text` TEXT NULL DEFAULT NULL,
  `time` BIGINT(20) NULL DEFAULT NULL,
  `labels` VARCHAR(255) NULL DEFAULT NULL,
  `origin` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `totime` (`to` ASC, `time` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
