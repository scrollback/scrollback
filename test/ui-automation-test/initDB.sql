-- MySQL dump 10.13  Distrib 5.5.29, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: scrollback
-- ------------------------------------------------------
-- Server version	5.5.29-0ubuntu0.12.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `room` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gateway` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `params` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('irc://scrollback.io/##testing','scrollback','irc','{}'),('irc://scrollback.io/#amalroom','amalroom','irc','{}'),('mailto:amal@scrollback.io','hannibal','mailto','{}'),('mailto:amalantony06@gmail.com','flarecat','mailto','{}'),('mailto:aravind@scrollback.io','aravind','mailto','{}');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` varchar(63) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `type` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `from` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `to` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8_unicode_ci,
  `time` bigint(20) DEFAULT NULL,
  `ref` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `origin` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `labels` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `from` (`from`),
  KEY `to` (`to`),
  KEY `time` (`time`),
  KEY `ref` (`ref`),
  KEY `origin` (`origin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('22enmbrdy0d5bcvczia8xyfmbnil7lwm','nick','guest-sb-furame','scrollback','',1382605950589,'flarecat','{\"gateway\":\"web\",\"location\":\"https://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('3xoq3x2g7ii9x1tw2rx8dwmtxeb2ocwx','text','guest-sb-efount','scrollback','Test message 2',1382605880570,NULL,'{\"gateway\":\"web\",\"location\":\"http://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('5kgclmeni75v7m12y8m9w3i2wc842zn0','back','guest-sb-furame','scrollback','',1382605853626,NULL,'{\"gateway\":\"web\",\"location\":\"https://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('62wzz91ah5yio4anujb8rwthqbv7rlto','back','guest-sb-nizede','scrollback','',1382605900556,NULL,'{\"gateway\":\"web\",\"location\":\"http://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('ab6t1cjng67n0stn0mkqsmc678atxsmf','back','guest-sb-furame','scrollback','',1382605827804,NULL,'{\"gateway\":\"web\",\"location\":\"http://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('dvdxlaj8boucnhk1mcm68h5z4wltabki','text','guest-sb-nizede','scrollback','Test message 3',1382605911390,NULL,'{\"gateway\":\"web\",\"location\":\"http://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('g0gz0nmxrg5162yg0vbctxd67w07wuwa','back','guest-sb-efount','scrollback','',1382605863111,NULL,'{\"gateway\":\"web\",\"location\":\"http://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('yfkn66oakk0kdk8x6kvg7h3m3vblptuj','text','guest-sb-furame','scrollback','Test message 1',1382605834073,NULL,'{\"gateway\":\"web\",\"location\":\"http://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}',''),('ynd8gr7f59iicpislpjqepzw7evwwoyr','text','flarecat','scrollback','Test message 4',1382605980031,NULL,'{\"gateway\":\"web\",\"location\":\"https://dev.scrollback.io/\",\"ip\":\"122.172.174.190\"}','');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `picture` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL,
  `profile` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdOn` datetime DEFAULT NULL,
  `owner` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type` varchar(15) COLLATE utf8_unicode_ci DEFAULT NULL,
  `params` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES ('amalroom','amalroom','','','','2013-10-19 07:38:44','hannibal','room','{\"irc\":true,\"loginrequired\":false,\"wordban\":false}'),('aravind','aravind','','','','2013-10-18 08:28:34','aravind','user','{}'),('flarecat','flarecat','','','','2013-10-18 09:44:26','flarecat','user','{}'),('hannibal','hannibal','','','','2013-10-19 07:07:02','hannibal','user','{}'),('scrollback','scrollback','','','','2013-10-18 08:29:08','aravind','room','{\"irc\":true,\"loginrequired\":false,\"wordban\":true}');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-10-24  9:14:39
