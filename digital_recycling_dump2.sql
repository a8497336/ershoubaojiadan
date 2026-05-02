-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: digital_recycling
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `digital_recycling`
--

/*!40000 DROP DATABASE IF EXISTS `digital_recycling`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `digital_recycling` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `digital_recycling`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `province` varchar(30) DEFAULT NULL,
  `city` varchar(30) DEFAULT NULL,
  `district` varchar(30) DEFAULT NULL,
  `detail` varchar(200) DEFAULT NULL,
  `is_default` tinyint DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=261 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (241,268,'用户1','13800000001','福建省','莆田市','市','莆田市市XX路XX号XX小区9栋7室',1,'2026-04-16 22:35:51','2026-04-30 21:07:57'),(242,269,'用户2','13800000002','安徽省','马鞍山市','市','马鞍山市市XX路XX号XX小区20栋25室',1,'2026-04-30 19:55:01','2026-04-30 21:07:57'),(243,270,'用户3','13800000003','广东省','珠海市','市','珠海市市XX路XX号XX小区12栋28室',1,'2026-04-18 06:01:41','2026-04-30 21:07:57'),(244,271,'用户4','13800000004','浙江省','宁波市','市','宁波市市XX路XX号XX小区16栋13室',1,'2026-04-21 23:33:47','2026-04-30 21:07:57'),(245,272,'用户5','13800000005','江苏省','常州市','县','常州市县XX路XX号XX小区11栋2室',1,'2026-04-19 10:14:52','2026-04-30 21:07:57'),(246,273,'用户6','13800000006','四川省','德阳市','区','德阳市区XX路XX号XX小区12栋27室',1,'2026-04-23 14:25:36','2026-04-30 21:07:57'),(247,274,'用户7','13800000007','湖北省','襄阳市','市','襄阳市市XX路XX号XX小区10栋17室',1,'2026-04-13 08:53:50','2026-04-30 21:07:57'),(248,275,'用户8','13800000008','湖南省','长沙市','区','长沙市区XX路XX号XX小区15栋21室',1,'2026-04-16 03:56:39','2026-04-30 21:07:57'),(249,276,'用户9','13800000009','河南省','郑州市','市','郑州市市XX路XX号XX小区7栋24室',1,'2026-04-13 12:55:20','2026-04-30 21:07:57'),(250,277,'用户10','13800000010','山东省','潍坊市','区','潍坊市区XX路XX号XX小区1栋26室',1,'2026-04-12 00:02:08','2026-04-30 21:07:57'),(251,278,'用户11','13800000011','福建省','莆田市','县','莆田市县XX路XX号XX小区10栋12室',1,'2026-04-29 12:35:12','2026-04-30 21:07:57'),(252,279,'用户12','13800000012','安徽省','芜湖市','县','芜湖市县XX路XX号XX小区6栋4室',1,'2026-04-18 05:03:29','2026-04-30 21:07:57'),(253,280,'用户13','13800000013','广东省','深圳市','区','深圳市区XX路XX号XX小区19栋19室',1,'2026-04-17 17:18:55','2026-04-30 21:07:57'),(254,281,'用户14','13800000014','浙江省','湖州市','市','湖州市市XX路XX号XX小区7栋29室',1,'2026-04-22 06:50:02','2026-04-30 21:07:57'),(255,282,'用户15','13800000015','江苏省','南京市','市','南京市市XX路XX号XX小区8栋27室',1,'2026-04-15 23:08:53','2026-04-30 21:07:57'),(256,283,'用户16','13800000016','四川省','宜宾市','区','宜宾市区XX路XX号XX小区12栋20室',1,'2026-04-13 06:09:38','2026-04-30 21:07:57'),(257,284,'用户17','13800000017','湖北省','襄阳市','区','襄阳市区XX路XX号XX小区18栋1室',1,'2026-04-14 10:12:22','2026-04-30 21:07:57'),(258,285,'用户18','13800000018','湖南省','岳阳市','区','岳阳市区XX路XX号XX小区6栋24室',1,'2026-04-17 15:31:47','2026-04-30 21:07:57'),(259,286,'用户19','13800000019','河南省','洛阳市','市','洛阳市市XX路XX号XX小区18栋28室',1,'2026-04-23 05:21:05','2026-04-30 21:07:57'),(260,287,'用户20','13800000020','山东省','青岛市','区','青岛市区XX路XX号XX小区11栋3室',1,'2026-04-14 12:07:32','2026-04-30 21:07:57');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint NOT NULL,
  `module` varchar(30) DEFAULT NULL,
  `action` varchar(30) DEFAULT NULL,
  `target_type` varchar(30) DEFAULT NULL,
  `target_id` varchar(50) DEFAULT NULL,
  `detail` text,
  `ip` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `real_name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `username_21` (`username`),
  UNIQUE KEY `username_22` (`username`),
  UNIQUE KEY `username_23` (`username`),
  UNIQUE KEY `username_24` (`username`),
  UNIQUE KEY `username_25` (`username`),
  UNIQUE KEY `username_26` (`username`),
  UNIQUE KEY `username_27` (`username`),
  UNIQUE KEY `username_28` (`username`),
  UNIQUE KEY `username_29` (`username`),
  UNIQUE KEY `username_30` (`username`),
  UNIQUE KEY `username_31` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','$2b$10$D8xOuop8kWYv9FuJ.gdsf.zlmjwfP7o9G4IcpfxFNE3dbM.tUOUNy','系统管理员',NULL,NULL,1,1,'2026-05-01 08:18:45','2026-04-27 21:47:02','2026-05-01 08:18:45');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `type` tinyint DEFAULT '1',
  `is_top` tinyint DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `publish_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (21,'五一假期服务通知','尊敬的用户，五一假期期间，我们的回收服务正常进行。请您放心使用。预计发货后3-5个工作日内完成回收审核。',1,1,1,'2026-04-28 21:07:58','2026-04-28 21:07:58','2026-04-30 21:07:57',0),(22,'会员权益升级公告','为回馈广大会员用户，我们升级了会员权益。现在开通年费会员，可享受更多专属折扣和优先客服服务。',1,1,1,'2026-04-25 21:07:58','2026-04-25 21:07:58','2026-04-30 21:07:57',0),(23,'iPhone 15 系列高价回收中','最新款 iPhone 15 系列现已支持高价回收。苹果全系列手机，我们提供市场最优价，欢迎比较。',2,0,1,'2026-04-23 21:07:58','2026-04-23 21:07:58','2026-04-30 21:07:57',0),(24,'环保回收，从我做起','每一台废旧手机的正确回收，都可以减少对环境的污染。让我们一起为绿色地球贡献力量。',3,0,1,'2026-04-20 21:07:58','2026-04-20 21:07:58','2026-04-30 21:07:57',0),(25,'门店地址更新通知','深圳门店已搬迁至华强北新址，具体地址可在门店页面查看。欢迎新老用户到店回收。',1,0,1,'2026-04-15 21:07:58','2026-04-15 21:07:58','2026-04-30 21:07:57',0);
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `subtitle` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `link_type` varchar(20) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (3,'诚信服务每一位客户','TRUSTED SERVICE',NULL,'page','/pages/index/index',3,1,NULL,NULL,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(4,'	 寻找城市合伙人','	 寻找城市合伙人','http://localhost:3000/uploads/1777384094453-j6koo4b84.png',NULL,NULL,1,1,NULL,NULL,'2026-04-28 21:30:04','2026-04-28 22:06:32');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `bg_color` varchar(20) DEFAULT NULL,
  `icon_text` varchar(20) DEFAULT NULL,
  `icon_style` varchar(100) DEFAULT NULL,
  `has_update` tinyint DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `quote_title` varchar(100) DEFAULT NULL,
  `quote_view_count` varchar(20) DEFAULT NULL,
  `quote_receiver_name` varchar(50) DEFAULT NULL,
  `quote_receiver_phone` varchar(20) DEFAULT NULL,
  `quote_receiver_address` text,
  `quote_rules` text,
  `quote_footer_notes` text,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `brands_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,1,'热门老年机','热门老年机',NULL,'bg-xiaomi','老年',NULL,1,1,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,'智能机/电容屏','智能机_电容屏',NULL,'bg-apple','智能',NULL,1,2,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,'手机拆机件','手机拆机件',NULL,'bg-huawei','拆机',NULL,1,3,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,1,'电池','电池',NULL,'bg-blackberry','电池',NULL,1,4,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,1,'OPPO','oppo',NULL,'bg-oppo','OP',NULL,1,5,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,'VIVO','vivo',NULL,'bg-vivo','V',NULL,1,6,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,1,'小米','小米',NULL,'bg-xiaomi','mi',NULL,1,7,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,1,'华为OK板','华为ok板',NULL,'bg-huawei','HW',NULL,1,8,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,1,'华为','华为',NULL,'bg-huawei','HW',NULL,1,9,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,1,'三星','三星',NULL,'bg-samsung','S',NULL,1,10,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,1,'苹果','苹果',NULL,'bg-apple','苹果',NULL,1,11,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,1,'高仿苹果','高仿苹果',NULL,'bg-apple','高仿',NULL,1,12,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,1,'金立','金立',NULL,'bg-jinli','G',NULL,1,13,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,1,'联想','联想',NULL,'bg-lenovo','L',NULL,1,14,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,1,'酷派/ivvi','酷派_ivvi',NULL,'bg-coolpad','cool',NULL,1,15,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,1,'魅族','魅族',NULL,'bg-meizu','M',NULL,1,16,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,1,'锤子','锤子',NULL,'bg-smartisan','T',NULL,1,17,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,1,'360','360',NULL,'bg-360','+',NULL,1,18,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,1,'HTC','htc',NULL,'bg-htc','htc',NULL,1,19,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,1,'黑莓','黑莓',NULL,'bg-blackberry','黑莓',NULL,1,20,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,1,'一加','一加',NULL,'bg-oneplus','1+',NULL,1,21,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,1,'真我/realme','真我_realme',NULL,'bg-realme','R',NULL,1,22,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,1,'诺基亚','诺基亚',NULL,'bg-nokia','N',NULL,1,23,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,1,'美图','美图',NULL,'bg-meitu','M',NULL,1,24,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,1,'乐视','乐视',NULL,'bg-leeco','L',NULL,1,25,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,1,'努比亚','努比亚',NULL,'bg-nubia','n',NULL,1,26,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,1,'中国移动','中国移动',NULL,'bg-chinamobile','移动',NULL,1,27,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,1,'TCL','tcl',NULL,'bg-tcl','T',NULL,1,28,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,1,'中兴','中兴',NULL,'bg-zte','Z',NULL,1,29,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,1,'8848','8848',NULL,'bg-8848','8848',NULL,1,30,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,1,'糖果/国美','糖果_国美',NULL,'bg-sugar','GOME',NULL,1,31,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,1,'步步高','步步高',NULL,'bg-bbk','步步',NULL,1,32,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,1,'海信','海信',NULL,'bg-hisense','H',NULL,1,33,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(34,1,'朵唯','朵唯',NULL,'bg-doov','D',NULL,1,34,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(35,1,'格力','格力',NULL,'bg-gree','G',NULL,1,35,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(36,1,'摩托罗拉','摩托罗拉',NULL,'bg-moto','M',NULL,1,36,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,1,'华硕','华硕',NULL,'bg-asus','A',NULL,1,37,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,1,'柔宇','柔宇',NULL,'bg-royole','柔',NULL,1,38,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(39,1,'谷歌Google','谷歌google',NULL,'bg-google','G',NULL,1,39,1,'2026-04-27 21:47:02','2026-04-27 21:47:02',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(40,2,'的',NULL,NULL,NULL,'老米',NULL,1,0,1,'2026-05-01 08:00:46','2026-05-01 08:00:46',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `condition_id` bigint NOT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `is_selected` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_user_id_product_id_condition_id` (`user_id`,`product_id`,`condition_id`),
  KEY `product_id` (`product_id`),
  KEY `condition_id` (`condition_id`),
  CONSTRAINT `carts_ibfk_91` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `carts_ibfk_92` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `carts_ibfk_93` FOREIGN KEY (`condition_id`) REFERENCES `product_conditions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (61,283,268,4,2,1197.00,0,'2026-04-28 13:39:49','2026-04-30 21:07:57'),(62,273,261,1,3,1277.00,1,'2026-04-27 03:12:40','2026-04-30 21:07:57'),(63,269,254,4,2,1320.00,1,'2026-04-26 20:12:03','2026-04-30 21:07:57'),(64,284,274,6,2,539.00,1,'2026-04-28 18:13:14','2026-04-30 21:07:57'),(65,284,275,2,2,1618.00,0,'2026-04-26 17:12:30','2026-04-30 21:07:57'),(66,279,288,5,1,262.00,1,'2026-04-29 09:10:46','2026-04-30 21:07:57'),(67,276,292,5,2,352.00,1,'2026-04-27 19:36:58','2026-04-30 21:07:57'),(68,281,254,3,2,1280.00,0,'2026-04-29 08:53:11','2026-04-30 21:07:57'),(69,287,270,6,3,980.00,1,'2026-04-27 16:41:07','2026-04-30 21:07:57'),(70,271,287,3,3,693.00,1,'2026-04-28 02:09:20','2026-04-30 21:07:57');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`),
  UNIQUE KEY `code_15` (`code`),
  UNIQUE KEY `code_16` (`code`),
  UNIQUE KEY `code_17` (`code`),
  UNIQUE KEY `code_18` (`code`),
  UNIQUE KEY `code_19` (`code`),
  UNIQUE KEY `code_20` (`code`),
  UNIQUE KEY `code_21` (`code`),
  UNIQUE KEY `code_22` (`code`),
  UNIQUE KEY `code_23` (`code`),
  UNIQUE KEY `code_24` (`code`),
  UNIQUE KEY `code_25` (`code`),
  UNIQUE KEY `code_26` (`code`),
  UNIQUE KEY `code_27` (`code`),
  UNIQUE KEY `code_28` (`code`),
  UNIQUE KEY `code_29` (`code`),
  UNIQUE KEY `code_30` (`code`),
  UNIQUE KEY `code_31` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'环保手机报价','phone',NULL,1,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(2,'废旧手机内配回收报价','internal',NULL,2,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(3,'电子产品杂货铺报价','electronics',NULL,3,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(4,'疑难机型查看','difficult',NULL,4,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(5,'靓机回收报价','goodPhone',NULL,5,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(6,'名酒回收报价','liquor',NULL,6,1,'2026-04-27 21:47:02','2026-04-27 21:47:02');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logistics_timelines`
--

DROP TABLE IF EXISTS `logistics_timelines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logistics_timelines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `happened_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `logistics_timelines_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logistics_timelines`
--

LOCK TABLES `logistics_timelines` WRITE;
/*!40000 ALTER TABLE `logistics_timelines` DISABLE KEYS */;
INSERT INTO `logistics_timelines` VALUES (92,92,'揽收成功','2026-04-26 21:07:57','2026-04-30 21:07:57'),(93,92,'运输中','2026-04-27 21:07:58','2026-04-30 21:07:57'),(94,92,'到达深圳分拨中心','2026-04-28 21:07:58','2026-04-30 21:07:57'),(95,92,'正在派送','2026-04-29 21:07:58','2026-04-30 21:07:57'),(96,93,'揽收成功','2026-04-26 21:07:58','2026-04-30 21:07:57'),(97,93,'运输中','2026-04-27 21:07:58','2026-04-30 21:07:57'),(98,93,'到达深圳分拨中心','2026-04-28 21:07:58','2026-04-30 21:07:57'),(99,93,'正在派送','2026-04-29 21:07:58','2026-04-30 21:07:57'),(100,94,'揽收成功','2026-04-27 21:07:58','2026-04-30 21:07:57'),(101,94,'运输中','2026-04-28 21:07:58','2026-04-30 21:07:57'),(102,94,'到达深圳分拨中心','2026-04-29 21:07:58','2026-04-30 21:07:57'),(103,96,'揽收成功','2026-04-27 21:07:58','2026-04-30 21:07:57'),(104,96,'运输中','2026-04-28 21:07:58','2026-04-30 21:07:57'),(105,96,'到达深圳分拨中心','2026-04-29 21:07:58','2026-04-30 21:07:57'),(106,97,'揽收成功','2026-04-26 21:07:58','2026-04-30 21:07:57'),(107,97,'运输中','2026-04-27 21:07:58','2026-04-30 21:07:57'),(108,97,'到达深圳分拨中心','2026-04-28 21:07:58','2026-04-30 21:07:57'),(109,97,'正在派送','2026-04-29 21:07:58','2026-04-30 21:07:57'),(110,100,'揽收成功','2026-04-27 21:07:58','2026-04-30 21:07:57'),(111,100,'运输中','2026-04-28 21:07:58','2026-04-30 21:07:57'),(112,100,'到达深圳分拨中心','2026-04-29 21:07:58','2026-04-30 21:07:57'),(113,104,'揽收成功','2026-04-28 21:07:58','2026-04-30 21:07:57'),(114,104,'运输中','2026-04-29 21:07:58','2026-04-30 21:07:57'),(115,105,'揽收成功','2026-04-28 21:07:58','2026-04-30 21:07:57'),(116,105,'运输中','2026-04-29 21:07:58','2026-04-30 21:07:57');
/*!40000 ALTER TABLE `logistics_timelines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_orders`
--

DROP TABLE IF EXISTS `membership_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `plan_id` bigint NOT NULL,
  `order_no` varchar(30) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pay_method` varchar(20) DEFAULT NULL,
  `pay_status` tinyint DEFAULT '0',
  `pay_time` datetime DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  UNIQUE KEY `order_no_2` (`order_no`),
  UNIQUE KEY `order_no_3` (`order_no`),
  UNIQUE KEY `order_no_4` (`order_no`),
  UNIQUE KEY `order_no_5` (`order_no`),
  UNIQUE KEY `order_no_6` (`order_no`),
  UNIQUE KEY `order_no_7` (`order_no`),
  UNIQUE KEY `order_no_8` (`order_no`),
  UNIQUE KEY `order_no_9` (`order_no`),
  UNIQUE KEY `order_no_10` (`order_no`),
  UNIQUE KEY `order_no_11` (`order_no`),
  UNIQUE KEY `order_no_12` (`order_no`),
  UNIQUE KEY `order_no_13` (`order_no`),
  UNIQUE KEY `order_no_14` (`order_no`),
  UNIQUE KEY `order_no_15` (`order_no`),
  UNIQUE KEY `order_no_16` (`order_no`),
  UNIQUE KEY `order_no_17` (`order_no`),
  UNIQUE KEY `order_no_18` (`order_no`),
  UNIQUE KEY `order_no_19` (`order_no`),
  UNIQUE KEY `order_no_20` (`order_no`),
  UNIQUE KEY `order_no_21` (`order_no`),
  UNIQUE KEY `order_no_22` (`order_no`),
  UNIQUE KEY `order_no_23` (`order_no`),
  UNIQUE KEY `order_no_24` (`order_no`),
  UNIQUE KEY `order_no_25` (`order_no`),
  UNIQUE KEY `order_no_26` (`order_no`),
  UNIQUE KEY `order_no_27` (`order_no`),
  UNIQUE KEY `order_no_28` (`order_no`),
  UNIQUE KEY `order_no_29` (`order_no`),
  UNIQUE KEY `order_no_30` (`order_no`),
  UNIQUE KEY `order_no_31` (`order_no`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `membership_orders_ibfk_61` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `membership_orders_ibfk_62` FOREIGN KEY (`plan_id`) REFERENCES `membership_plans` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_orders`
--

LOCK TABLES `membership_orders` WRITE;
/*!40000 ALTER TABLE `membership_orders` DISABLE KEYS */;
INSERT INTO `membership_orders` VALUES (21,287,3,'MEM17775544780680001',110.00,'wechat',1,'2026-04-08 07:41:00',NULL,NULL,'2026-04-14 10:02:34','2026-04-30 21:07:57'),(22,281,6,'MEM17775544780680002',119.00,'wechat',1,'2026-04-10 00:52:42',NULL,NULL,'2026-04-09 19:36:39','2026-04-30 21:07:57'),(23,284,2,'MEM17775544780680003',79.00,'wechat',1,'2026-04-24 23:51:41',NULL,NULL,'2026-04-29 08:50:33','2026-04-30 21:07:57'),(24,268,5,'MEM17775544780680004',299.00,'wechat',1,'2026-04-08 23:46:27',NULL,NULL,'2026-04-17 22:31:51','2026-04-30 21:07:57'),(25,274,3,'MEM17775544780680005',110.00,'wechat',1,'2026-04-29 06:02:07',NULL,NULL,'2026-04-01 20:57:05','2026-04-30 21:07:57'),(26,282,4,'MEM17775544780680006',199.00,'wechat',1,'2026-04-02 03:03:35',NULL,NULL,'2026-04-08 17:55:18','2026-04-30 21:07:57'),(27,279,1,'MEM17775544780680007',39.00,'wechat',1,'2026-04-12 13:33:17',NULL,NULL,'2026-04-20 08:26:36','2026-04-30 21:07:57'),(28,284,6,'MEM17775544780680008',119.00,'wechat',1,'2026-04-07 17:18:15',NULL,NULL,'2026-04-04 01:51:45','2026-04-30 21:07:57'),(29,282,5,'MEM17775544780680009',299.00,'wechat',1,'2026-04-08 17:08:19',NULL,NULL,'2026-04-27 06:53:31','2026-04-30 21:07:57'),(30,281,3,'MEM17775544780680010',110.00,'wechat',1,'2026-04-01 01:40:06',NULL,NULL,'2026-04-14 05:48:27','2026-04-30 21:07:57');
/*!40000 ALTER TABLE `membership_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_plans`
--

DROP TABLE IF EXISTS `membership_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `key_code` varchar(30) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `duration_days` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) NOT NULL,
  `subscriber_count` int DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_code` (`key_code`),
  UNIQUE KEY `key_code_2` (`key_code`),
  UNIQUE KEY `key_code_3` (`key_code`),
  UNIQUE KEY `key_code_4` (`key_code`),
  UNIQUE KEY `key_code_5` (`key_code`),
  UNIQUE KEY `key_code_6` (`key_code`),
  UNIQUE KEY `key_code_7` (`key_code`),
  UNIQUE KEY `key_code_8` (`key_code`),
  UNIQUE KEY `key_code_9` (`key_code`),
  UNIQUE KEY `key_code_10` (`key_code`),
  UNIQUE KEY `key_code_11` (`key_code`),
  UNIQUE KEY `key_code_12` (`key_code`),
  UNIQUE KEY `key_code_13` (`key_code`),
  UNIQUE KEY `key_code_14` (`key_code`),
  UNIQUE KEY `key_code_15` (`key_code`),
  UNIQUE KEY `key_code_16` (`key_code`),
  UNIQUE KEY `key_code_17` (`key_code`),
  UNIQUE KEY `key_code_18` (`key_code`),
  UNIQUE KEY `key_code_19` (`key_code`),
  UNIQUE KEY `key_code_20` (`key_code`),
  UNIQUE KEY `key_code_21` (`key_code`),
  UNIQUE KEY `key_code_22` (`key_code`),
  UNIQUE KEY `key_code_23` (`key_code`),
  UNIQUE KEY `key_code_24` (`key_code`),
  UNIQUE KEY `key_code_25` (`key_code`),
  UNIQUE KEY `key_code_26` (`key_code`),
  UNIQUE KEY `key_code_27` (`key_code`),
  UNIQUE KEY `key_code_28` (`key_code`),
  UNIQUE KEY `key_code_29` (`key_code`),
  UNIQUE KEY `key_code_30` (`key_code`),
  UNIQUE KEY `key_code_31` (`key_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_plans`
--

LOCK TABLES `membership_plans` WRITE;
/*!40000 ALTER TABLE `membership_plans` DISABLE KEYS */;
INSERT INTO `membership_plans` VALUES (1,'month','月度会员权限',30,40.00,99.00,63242,1,1,'2026-04-27 21:47:02','2026-05-01 07:46:15'),(2,'quarter','季度会员权限',90,79.00,159.00,6703,2,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(3,'half','半年会员权限',180,110.00,299.00,3356,3,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(4,'two-year','两年会员权限',730,199.00,399.00,11977,4,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(5,'three-year','三年会员权限',1095,299.00,599.00,1080,5,1,'2026-04-27 21:47:02','2026-04-27 21:47:02'),(6,'year','一年会员权限',365,119.00,299.00,38945,6,1,'2026-04-27 21:47:02','2026-04-27 21:47:02');
/*!40000 ALTER TABLE `membership_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `is_read` tinyint DEFAULT '0',
  `is_broadcast` tinyint DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=180 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (143,268,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-22 21:25:08'),(144,268,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-24 11:28:15'),(145,269,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-29 00:56:09'),(146,269,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-23 14:04:53'),(147,269,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-24 16:51:58'),(148,270,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-24 20:26:18'),(149,270,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-23 10:24:36'),(150,270,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-24 04:36:08'),(151,271,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-23 11:39:48'),(152,272,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-30 00:03:01'),(153,272,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-25 13:19:05'),(154,273,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-25 20:08:09'),(155,274,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-21 13:43:18'),(156,275,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,0,0,'2026-04-25 17:22:59'),(157,276,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-26 09:37:50'),(158,276,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-22 00:50:16'),(159,276,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-25 17:45:15'),(160,276,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,0,0,'2026-04-30 19:46:38'),(161,277,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-27 14:39:58'),(162,278,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-27 01:19:21'),(163,278,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-24 06:53:31'),(164,278,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,0,0,'2026-04-30 20:25:38'),(165,279,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-24 14:32:53'),(166,280,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-24 22:04:31'),(167,280,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,0,0,'2026-04-23 06:05:41'),(168,280,'order','订单已发货','您的订单已发货，请注意查收',NULL,0,0,'2026-04-21 00:30:03'),(169,281,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,0,0,'2026-04-26 16:24:31'),(170,282,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-30 04:45:05'),(171,282,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-28 11:41:49'),(172,283,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-27 11:40:03'),(173,284,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,0,0,'2026-04-29 02:13:10'),(174,284,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,1,0,'2026-04-24 20:05:57'),(175,285,'order','订单已发货','您的订单已发货，请注意查收',NULL,1,0,'2026-04-24 23:01:53'),(176,286,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,0,0,'2026-04-29 08:20:17'),(177,287,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-22 06:53:49'),(178,287,'recycle','回收价格已确认','恭喜！您的回收订单已通过审核，款项将很快打入您的钱包',NULL,0,0,'2026-04-22 20:56:49'),(179,287,'membership','会员权益提醒','您的会员即将到期，为了不影响您的专属权益，请及时续费',NULL,1,0,'2026-04-28 06:56:46');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `product_name` varchar(100) DEFAULT NULL,
  `condition_name` varchar(30) DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=213 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (177,91,275,'Galaxy Z Flip5','状况4',2,1081.00,2162.00,'2026-04-06 21:26:36'),(178,91,277,'Find X7 Ultra','状况3',2,350.00,700.00,'2026-04-06 21:26:36'),(179,92,288,'V29 Pro','状况6',2,1015.00,2030.00,'2026-04-03 22:10:50'),(180,92,293,'A98','状况3',2,386.00,772.00,'2026-04-03 22:10:50'),(181,93,255,'iPhone 15','状况2',1,1656.00,1656.00,'2026-04-12 13:23:06'),(182,93,254,'iPhone 15 Pro','状况2',1,735.00,735.00,'2026-04-12 13:23:06'),(183,93,276,'Galaxy S23','状况1',1,1627.00,1627.00,'2026-04-12 13:23:06'),(184,94,287,'X80 Pro','状况6',2,1539.00,3078.00,'2026-04-24 11:08:37'),(185,95,257,'iPhone 14','状况7',2,773.00,1546.00,'2026-04-19 11:34:03'),(186,96,284,'X100','状况8',2,782.00,1564.00,'2026-04-09 07:16:54'),(187,96,288,'V29 Pro','状况6',1,1670.00,1670.00,'2026-04-09 07:16:54'),(188,96,274,'Galaxy Z Fold5','状况4',2,1525.00,3050.00,'2026-04-09 07:16:54'),(189,97,282,'Find X5 Pro','状况7',2,214.00,428.00,'2026-04-08 15:26:25'),(190,98,258,'iPhone 13','状况8',2,1651.00,3302.00,'2026-04-01 04:47:27'),(191,99,260,'Mate 60','状况3',2,215.00,430.00,'2026-04-09 05:57:22'),(192,99,278,'Find X7 Pro','状况5',1,699.00,699.00,'2026-04-09 05:57:22'),(193,99,261,'P60 Pro','状况3',1,932.00,932.00,'2026-04-09 05:57:22'),(194,100,270,'Redmi Note 13 Pro','状况6',1,329.00,329.00,'2026-04-26 02:57:22'),(195,100,293,'A98','状况2',2,640.00,1280.00,'2026-04-26 02:57:22'),(196,100,269,'Redmi K70 Pro','状况2',1,1635.00,1635.00,'2026-04-26 02:57:22'),(197,101,268,'Xiaomi 13 Pro','状况7',2,501.00,1002.00,'2026-04-04 16:46:53'),(198,102,284,'X100','状况4',2,738.00,1476.00,'2026-04-25 14:07:56'),(199,102,269,'Redmi K70 Pro','状况6',1,1602.00,1602.00,'2026-04-25 14:07:56'),(200,102,273,'Galaxy S24','状况6',2,1370.00,2740.00,'2026-04-25 14:07:56'),(201,103,264,'Mate 40 Pro','状况3',2,394.00,788.00,'2026-04-01 18:02:16'),(202,103,269,'Redmi K70 Pro','状况7',2,1595.00,3190.00,'2026-04-01 18:02:16'),(203,104,276,'Galaxy S23','状况6',2,686.00,1372.00,'2026-04-05 13:37:09'),(204,104,286,'X90 Pro','状况2',1,1094.00,1094.00,'2026-04-05 13:37:09'),(205,104,259,'Mate 60 Pro','状况4',2,1275.00,2550.00,'2026-04-05 13:37:09'),(206,105,261,'P60 Pro','状况5',2,1392.00,2784.00,'2026-04-16 07:00:29'),(207,105,292,'K11','状况2',1,527.00,527.00,'2026-04-16 07:00:29'),(208,106,254,'iPhone 15 Pro','开机屏好',1,1900.00,1900.00,'2026-05-01 07:43:13'),(209,106,254,'iPhone 15 Pro','开机大屏好',1,1700.00,1700.00,'2026-05-01 07:43:13'),(210,106,254,'iPhone 15 Pro','开机小屏好',1,1500.00,1500.00,'2026-05-01 07:43:13'),(211,106,254,'iPhone 15 Pro','开机屏坏',1,1300.00,1300.00,'2026-05-01 07:43:13'),(212,106,254,'iPhone 15 Pro','不开机',1,1100.00,1100.00,'2026-05-01 07:43:13');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_no` varchar(30) NOT NULL,
  `user_id` bigint NOT NULL,
  `status` varchar(20) DEFAULT 'shipping',
  `total_amount` decimal(12,2) NOT NULL,
  `actual_amount` decimal(12,2) DEFAULT NULL,
  `receiver_name` varchar(50) DEFAULT NULL,
  `receiver_phone` varchar(20) DEFAULT NULL,
  `receiver_address` varchar(300) DEFAULT NULL,
  `logistics_company` varchar(50) DEFAULT NULL,
  `tracking_no` varchar(50) DEFAULT NULL,
  `logistics_status` varchar(20) DEFAULT NULL,
  `cancel_reason` varchar(200) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `remark` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  UNIQUE KEY `order_no_2` (`order_no`),
  UNIQUE KEY `order_no_3` (`order_no`),
  UNIQUE KEY `order_no_4` (`order_no`),
  UNIQUE KEY `order_no_5` (`order_no`),
  UNIQUE KEY `order_no_6` (`order_no`),
  UNIQUE KEY `order_no_7` (`order_no`),
  UNIQUE KEY `order_no_8` (`order_no`),
  UNIQUE KEY `order_no_9` (`order_no`),
  UNIQUE KEY `order_no_10` (`order_no`),
  UNIQUE KEY `order_no_11` (`order_no`),
  UNIQUE KEY `order_no_12` (`order_no`),
  UNIQUE KEY `order_no_13` (`order_no`),
  UNIQUE KEY `order_no_14` (`order_no`),
  UNIQUE KEY `order_no_15` (`order_no`),
  UNIQUE KEY `order_no_16` (`order_no`),
  UNIQUE KEY `order_no_17` (`order_no`),
  UNIQUE KEY `order_no_18` (`order_no`),
  UNIQUE KEY `order_no_19` (`order_no`),
  UNIQUE KEY `order_no_20` (`order_no`),
  UNIQUE KEY `order_no_21` (`order_no`),
  UNIQUE KEY `order_no_22` (`order_no`),
  UNIQUE KEY `order_no_23` (`order_no`),
  UNIQUE KEY `order_no_24` (`order_no`),
  UNIQUE KEY `order_no_25` (`order_no`),
  UNIQUE KEY `order_no_26` (`order_no`),
  UNIQUE KEY `order_no_27` (`order_no`),
  UNIQUE KEY `order_no_28` (`order_no`),
  UNIQUE KEY `order_no_29` (`order_no`),
  UNIQUE KEY `order_no_30` (`order_no`),
  UNIQUE KEY `order_no_31` (`order_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (91,'ORD17775544779910001',272,'pending',2862.00,NULL,'用户5','13800000005','江苏省常州市县常州市县XX路XX号XX小区11栋2室',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-06 21:26:36','2026-04-30 21:07:57'),(92,'ORD17775544779910002',278,'completed',2802.00,2661.90,'用户11','13800000011','福建省莆田市县莆田市县XX路XX号XX小区10栋12室','圆通速递','1777554477991604054','received',NULL,'2026-04-04 22:10:50','2026-04-06 22:10:50',NULL,NULL,'2026-04-03 22:10:50','2026-04-30 21:07:57'),(93,'ORD17775544779910003',272,'completed',4018.00,3817.10,'用户5','13800000005','江苏省常州市县常州市县XX路XX号XX小区11栋2室','中通快递','1777554477991279429','received',NULL,'2026-04-13 13:23:06','2026-04-15 13:23:06',NULL,NULL,'2026-04-12 13:23:06','2026-04-30 21:07:57'),(94,'ORD17775544779910004',272,'completed',3078.00,2924.10,'用户5','13800000005','江苏省常州市县常州市县XX路XX号XX小区11栋2室','韵达快递','1777554477991173012','received',NULL,'2026-04-25 11:08:37','2026-04-27 11:08:37',NULL,NULL,'2026-04-24 11:08:37','2026-04-30 21:07:57'),(95,'ORD17775544779910005',285,'cancelled',1546.00,NULL,'用户18','13800000018','湖南省岳阳市区岳阳市区XX路XX号XX小区6栋24室','中通快递','1777554477991472657',NULL,NULL,NULL,NULL,'2026-04-21 11:34:03',NULL,'2026-04-19 11:34:03','2026-04-30 21:07:57'),(96,'ORD17775544779910006',285,'completed',6284.00,5969.80,'用户18','13800000018','湖南省岳阳市区岳阳市区XX路XX号XX小区6栋24室','韵达快递','1777554477991179595','received',NULL,'2026-04-10 07:16:54','2026-04-12 07:16:54',NULL,'用户备注：物品完好','2026-04-09 07:16:54','2026-04-30 21:07:57'),(97,'ORD17775544779910007',283,'shipping',428.00,NULL,'用户16','13800000016','四川省宜宾市区宜宾市区XX路XX号XX小区12栋20室','圆通速递','1777554477991168024','transit',NULL,NULL,NULL,NULL,NULL,'2026-04-08 15:26:25','2026-04-30 21:07:57'),(98,'ORD17775544779910008',281,'cancelled',3302.00,NULL,'用户14','13800000014','浙江省湖州市市湖州市市XX路XX号XX小区7栋29室','顺丰速运','1777554477991402711',NULL,NULL,NULL,NULL,'2026-04-03 04:47:27','用户备注：物品完好','2026-04-01 04:47:27','2026-04-30 21:07:57'),(99,'ORD17775544779910009',272,'cancelled',2061.00,NULL,'用户5','13800000005','江苏省常州市县常州市县XX路XX号XX小区11栋2室','圆通速递','1777554477991231652',NULL,NULL,NULL,NULL,'2026-04-11 05:57:22','用户备注：物品完好','2026-04-09 05:57:22','2026-04-30 21:07:57'),(100,'ORD17775544779910010',273,'shipping',3244.00,NULL,'用户6','13800000006','四川省德阳市区德阳市区XX路XX号XX小区12栋27室','顺丰速运','1777554477991215988','transit',NULL,NULL,NULL,NULL,NULL,'2026-04-26 02:57:22','2026-04-30 21:07:57'),(101,'ORD17775544779910011',280,'pending',1002.00,NULL,'用户13','13800000013','广东省深圳市区深圳市区XX路XX号XX小区19栋19室',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-04 16:46:53','2026-04-30 21:07:57'),(102,'ORD17775544779910012',286,'cancelled',5818.00,NULL,'用户19','13800000019','河南省洛阳市市洛阳市市XX路XX号XX小区18栋28室','圆通速递','1777554477991382356',NULL,NULL,NULL,NULL,'2026-04-27 14:07:56',NULL,'2026-04-25 14:07:56','2026-04-30 21:07:57'),(103,'ORD17775544779910013',286,'cancelled',3978.00,NULL,'用户19','13800000019','河南省洛阳市市洛阳市市XX路XX号XX小区18栋28室','韵达快递','1777554477991552803',NULL,NULL,NULL,NULL,'2026-04-03 18:02:16',NULL,'2026-04-01 18:02:16','2026-04-30 21:07:57'),(104,'ORD17775544779910014',279,'completed',5016.00,4765.20,'用户12','13800000012','安徽省芜湖市县芜湖市县XX路XX号XX小区6栋4室','中通快递','1777554477991976761','received',NULL,'2026-04-06 13:37:09','2026-04-08 13:37:09',NULL,'用户备注：物品完好','2026-04-05 13:37:09','2026-04-30 21:07:57'),(105,'ORD17775544779910015',286,'completed',3311.00,3145.45,'用户19','13800000019','河南省洛阳市市洛阳市市XX路XX号XX小区18栋28室','韵达快递','1777554477991620690','received',NULL,'2026-04-17 07:00:29','2026-04-19 07:00:29',NULL,NULL,'2026-04-16 07:00:29','2026-04-30 21:07:57'),(106,'ORD202605010743139748',288,'shipping',7500.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'','2026-05-01 07:43:13','2026-05-01 07:43:13');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` tinyint DEFAULT NULL,
  `parent_id` bigint DEFAULT '0',
  `path` varchar(100) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`),
  UNIQUE KEY `code_15` (`code`),
  UNIQUE KEY `code_16` (`code`),
  UNIQUE KEY `code_17` (`code`),
  UNIQUE KEY `code_18` (`code`),
  UNIQUE KEY `code_19` (`code`),
  UNIQUE KEY `code_20` (`code`),
  UNIQUE KEY `code_21` (`code`),
  UNIQUE KEY `code_22` (`code`),
  UNIQUE KEY `code_23` (`code`),
  UNIQUE KEY `code_24` (`code`),
  UNIQUE KEY `code_25` (`code`),
  UNIQUE KEY `code_26` (`code`),
  UNIQUE KEY `code_27` (`code`),
  UNIQUE KEY `code_28` (`code`),
  UNIQUE KEY `code_29` (`code`),
  UNIQUE KEY `code_30` (`code`),
  UNIQUE KEY `code_31` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `points_logs`
--

DROP TABLE IF EXISTS `points_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `points_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` tinyint DEFAULT NULL,
  `points` int NOT NULL,
  `balance_after` int DEFAULT NULL,
  `source` varchar(30) DEFAULT NULL,
  `source_id` varchar(50) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `points_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=345 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points_logs`
--

LOCK TABLES `points_logs` WRITE;
/*!40000 ALTER TABLE `points_logs` DISABLE KEYS */;
INSERT INTO `points_logs` VALUES (292,268,2,25,381,'recycle','recycle_1777554477950_yutflpchp','回收奖励','2026-04-25 14:29:18'),(293,268,4,20,636,'bonus','bonus_1777554477950_4v2p5mg9o','活动奖励','2026-04-15 16:13:24'),(294,268,1,31,216,'sign','sign_1777554477950_l9ry1c3er','每日签到','2026-04-16 19:43:50'),(295,269,2,29,526,'recycle','recycle_1777554477950_8wo7g26p6','回收奖励','2026-04-11 15:16:44'),(296,270,4,21,542,'bonus','bonus_1777554477950_9sppfmswu','活动奖励','2026-04-26 21:52:22'),(297,270,1,6,404,'sign','sign_1777554477950_bu5br9dlp','每日签到','2026-04-18 02:28:58'),(298,270,3,26,734,'exchange','exchange_1777554477950_yldlzw8n2','积分兑换','2026-04-14 13:13:40'),(299,270,2,5,370,'recycle','recycle_1777554477950_qrt9ew0hu','回收奖励','2026-04-29 15:43:35'),(300,271,3,34,71,'exchange','exchange_1777554477950_zz75u61vq','积分兑换','2026-04-20 03:14:38'),(301,272,4,31,415,'bonus','bonus_1777554477950_eo1e1a5h6','活动奖励','2026-04-27 11:36:29'),(302,272,3,22,344,'exchange','exchange_1777554477950_cvrvmtguu','积分兑换','2026-04-17 14:07:20'),(303,273,1,21,564,'sign','sign_1777554477950_nbiyho117','每日签到','2026-04-17 20:56:41'),(304,273,1,31,135,'sign','sign_1777554477950_rxgsrm1gl','每日签到','2026-04-13 20:21:01'),(305,273,4,14,1002,'bonus','bonus_1777554477950_xe8zexh26','活动奖励','2026-04-12 17:44:48'),(306,273,4,33,723,'bonus','bonus_1777554477950_bfb68mxg1','活动奖励','2026-04-19 15:00:55'),(307,274,3,15,96,'exchange','exchange_1777554477950_1qdomu4ux','积分兑换','2026-04-14 11:26:47'),(308,274,1,32,219,'sign','sign_1777554477950_f2r43e374','每日签到','2026-04-17 09:29:58'),(309,274,2,26,105,'recycle','recycle_1777554477950_phkt2e5gb','回收奖励','2026-04-17 07:40:01'),(310,274,4,13,767,'bonus','bonus_1777554477950_99l6z4um8','活动奖励','2026-04-29 06:31:01'),(311,275,4,9,755,'bonus','bonus_1777554477950_sne030ogg','活动奖励','2026-04-26 22:03:02'),(312,276,2,11,12,'recycle','recycle_1777554477950_lylze3q9x','回收奖励','2026-04-29 03:23:24'),(313,276,3,14,881,'exchange','exchange_1777554477950_mmsrnif8z','积分兑换','2026-04-18 16:51:51'),(314,276,1,15,789,'sign','sign_1777554477950_ijga8ypg8','每日签到','2026-04-22 12:17:57'),(315,277,3,10,574,'exchange','exchange_1777554477950_ktpaw8bw6','积分兑换','2026-04-26 03:14:50'),(316,277,3,9,854,'exchange','exchange_1777554477950_fst9ratng','积分兑换','2026-04-23 10:19:45'),(317,277,2,6,694,'recycle','recycle_1777554477950_3ifjqik93','回收奖励','2026-04-25 23:26:24'),(318,278,3,16,784,'exchange','exchange_1777554477950_lkh81qaxg','积分兑换','2026-04-15 14:29:54'),(319,278,4,31,239,'bonus','bonus_1777554477950_v8qk3psfa','活动奖励','2026-04-20 17:02:00'),(320,278,3,28,259,'exchange','exchange_1777554477950_jae4b0j58','积分兑换','2026-04-13 00:25:41'),(321,278,1,6,897,'sign','sign_1777554477950_kpdsg0zm3','每日签到','2026-04-18 14:12:51'),(322,279,3,31,987,'exchange','exchange_1777554477950_5v9i1yz6o','积分兑换','2026-04-25 12:00:36'),(323,279,4,5,185,'bonus','bonus_1777554477950_aygp9y9d8','活动奖励','2026-04-23 21:09:01'),(324,280,3,19,346,'exchange','exchange_1777554477950_j22xsvyxb','积分兑换','2026-04-16 16:16:56'),(325,280,4,19,130,'bonus','bonus_1777554477950_c2pt2vosi','活动奖励','2026-04-28 22:47:25'),(326,280,2,7,368,'recycle','recycle_1777554477950_mh37u599s','回收奖励','2026-04-14 01:51:04'),(327,280,4,23,495,'bonus','bonus_1777554477950_grrwo6zp7','活动奖励','2026-04-11 13:14:59'),(328,281,3,34,630,'exchange','exchange_1777554477950_4pf0hs3v5','积分兑换','2026-04-19 07:45:30'),(329,281,1,33,429,'sign','sign_1777554477950_xs17sid3o','每日签到','2026-04-26 10:36:51'),(330,281,3,11,428,'exchange','exchange_1777554477950_uxv5gw9u6','积分兑换','2026-04-20 13:29:15'),(331,281,1,22,41,'sign','sign_1777554477950_1671ztz0o','每日签到','2026-04-19 08:27:07'),(332,282,3,13,928,'exchange','exchange_1777554477950_fa094cnky','积分兑换','2026-04-25 10:56:42'),(333,283,2,29,700,'recycle','recycle_1777554477950_f3dkhasj6','回收奖励','2026-04-23 03:19:06'),(334,283,3,21,651,'exchange','exchange_1777554477950_bm1myrsqy','积分兑换','2026-04-21 09:14:27'),(335,283,1,11,572,'sign','sign_1777554477950_l37t6zigp','每日签到','2026-04-27 11:14:13'),(336,284,4,25,329,'bonus','bonus_1777554477950_3roabao4c','活动奖励','2026-04-24 10:36:27'),(337,284,2,19,655,'recycle','recycle_1777554477950_t4nq9qndn','回收奖励','2026-04-17 16:44:38'),(338,284,1,21,367,'sign','sign_1777554477950_foww3gfhy','每日签到','2026-04-13 00:09:39'),(339,284,4,5,417,'bonus','bonus_1777554477950_1ssoshqqe','活动奖励','2026-04-20 21:27:27'),(340,285,4,34,240,'bonus','bonus_1777554477950_ioamz2xr2','活动奖励','2026-04-15 21:43:56'),(341,286,4,21,212,'bonus','bonus_1777554477950_2vjuw9qm0','活动奖励','2026-04-19 05:37:17'),(342,286,2,23,753,'recycle','recycle_1777554477950_inescdtz0','回收奖励','2026-04-21 17:53:55'),(343,286,3,32,543,'exchange','exchange_1777554477950_wg946gptt','积分兑换','2026-04-24 08:06:33'),(344,287,1,34,161,'sign','sign_1777554477950_55ag1jilo','每日签到','2026-04-21 07:16:45');
/*!40000 ALTER TABLE `points_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_histories`
--

DROP TABLE IF EXISTS `price_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_histories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `condition_id` bigint NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `new_price` decimal(10,2) DEFAULT NULL,
  `change_date` date NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=347 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_histories`
--

LOCK TABLES `price_histories` WRITE;
/*!40000 ALTER TABLE `price_histories` DISABLE KEYS */;
INSERT INTO `price_histories` VALUES (1,253,1,2000.00,3000.00,'2026-04-30','2026-04-30 22:35:25'),(2,253,2,1800.00,1800.00,'2026-04-30','2026-04-30 22:35:25'),(3,253,3,1600.00,1600.00,'2026-04-30','2026-04-30 22:35:25'),(4,253,4,1400.00,1400.00,'2026-04-30','2026-04-30 22:35:25'),(5,253,5,1200.00,1200.00,'2026-04-30','2026-04-30 22:35:25'),(6,253,6,1000.00,1000.00,'2026-04-30','2026-04-30 22:35:25'),(7,253,7,800.00,800.00,'2026-04-30','2026-04-30 22:35:25'),(8,253,8,600.00,600.00,'2026-04-30','2026-04-30 22:35:25'),(9,254,1,1900.00,1900.00,'2026-04-30','2026-04-30 22:35:25'),(10,254,2,1700.00,1700.00,'2026-04-30','2026-04-30 22:35:25'),(11,254,3,1500.00,1500.00,'2026-04-30','2026-04-30 22:35:25'),(12,254,4,1300.00,1300.00,'2026-04-30','2026-04-30 22:35:25'),(13,254,5,1100.00,1100.00,'2026-04-30','2026-04-30 22:35:25'),(14,254,6,900.00,900.00,'2026-04-30','2026-04-30 22:35:25'),(15,254,7,700.00,700.00,'2026-04-30','2026-04-30 22:35:25'),(16,254,8,500.00,500.00,'2026-04-30','2026-04-30 22:35:25'),(17,255,1,1800.00,1800.00,'2026-04-30','2026-04-30 22:35:25'),(18,255,2,1600.00,1600.00,'2026-04-30','2026-04-30 22:35:25'),(19,255,3,1400.00,1400.00,'2026-04-30','2026-04-30 22:35:25'),(20,255,4,1200.00,1200.00,'2026-04-30','2026-04-30 22:35:25'),(21,255,5,1000.00,1000.00,'2026-04-30','2026-04-30 22:35:25'),(22,255,6,800.00,800.00,'2026-04-30','2026-04-30 22:35:25'),(23,255,7,600.00,600.00,'2026-04-30','2026-04-30 22:35:25'),(24,255,8,400.00,400.00,'2026-04-30','2026-04-30 22:35:25'),(25,256,1,1700.00,1700.00,'2026-04-30','2026-04-30 22:35:25'),(26,256,2,1500.00,1500.00,'2026-04-30','2026-04-30 22:35:25'),(27,256,3,1300.00,1300.00,'2026-04-30','2026-04-30 22:35:25'),(28,256,4,1100.00,1100.00,'2026-04-30','2026-04-30 22:35:25'),(29,256,5,900.00,900.00,'2026-04-30','2026-04-30 22:35:25'),(30,256,6,700.00,700.00,'2026-04-30','2026-04-30 22:35:25'),(31,256,7,500.00,500.00,'2026-04-30','2026-04-30 22:35:25'),(32,256,8,300.00,300.00,'2026-04-30','2026-04-30 22:35:25'),(33,257,1,1600.00,1600.00,'2026-04-30','2026-04-30 22:35:25'),(34,257,2,1400.00,1400.00,'2026-04-30','2026-04-30 22:35:25'),(35,257,3,1200.00,1200.00,'2026-04-30','2026-04-30 22:35:25'),(36,257,4,1000.00,1000.00,'2026-04-30','2026-04-30 22:35:25'),(37,257,5,800.00,800.00,'2026-04-30','2026-04-30 22:35:25'),(38,257,6,600.00,600.00,'2026-04-30','2026-04-30 22:35:25'),(39,257,7,400.00,400.00,'2026-04-30','2026-04-30 22:35:25'),(40,257,8,200.00,200.00,'2026-04-30','2026-04-30 22:35:25'),(41,258,1,1500.00,1500.00,'2026-04-30','2026-04-30 22:35:25'),(42,258,2,1300.00,1300.00,'2026-04-30','2026-04-30 22:35:25'),(43,258,3,1100.00,1100.00,'2026-04-30','2026-04-30 22:35:25'),(44,258,4,900.00,900.00,'2026-04-30','2026-04-30 22:35:25'),(45,258,5,700.00,700.00,'2026-04-30','2026-04-30 22:35:25'),(46,258,6,500.00,500.00,'2026-04-30','2026-04-30 22:35:25'),(47,258,7,300.00,300.00,'2026-04-30','2026-04-30 22:35:25'),(48,258,8,100.00,100.00,'2026-04-30','2026-04-30 22:35:25'),(49,259,1,1400.00,1400.00,'2026-04-30','2026-04-30 22:35:25'),(50,259,2,1200.00,1200.00,'2026-04-30','2026-04-30 22:35:25'),(51,259,3,1000.00,1000.00,'2026-04-30','2026-04-30 22:35:25'),(52,259,4,800.00,800.00,'2026-04-30','2026-04-30 22:35:25'),(53,259,5,600.00,600.00,'2026-04-30','2026-04-30 22:35:25'),(54,259,6,400.00,400.00,'2026-04-30','2026-04-30 22:35:25'),(55,259,7,200.00,200.00,'2026-04-30','2026-04-30 22:35:25'),(56,259,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:25'),(57,260,1,1300.00,1300.00,'2026-04-30','2026-04-30 22:35:25'),(58,260,2,1100.00,1100.00,'2026-04-30','2026-04-30 22:35:25'),(59,260,3,900.00,900.00,'2026-04-30','2026-04-30 22:35:25'),(60,260,4,700.00,700.00,'2026-04-30','2026-04-30 22:35:25'),(61,260,5,500.00,500.00,'2026-04-30','2026-04-30 22:35:25'),(62,260,6,300.00,300.00,'2026-04-30','2026-04-30 22:35:25'),(63,260,7,100.00,100.00,'2026-04-30','2026-04-30 22:35:25'),(64,260,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:25'),(65,261,1,1200.00,1200.00,'2026-04-30','2026-04-30 22:35:25'),(66,261,2,1000.00,1000.00,'2026-04-30','2026-04-30 22:35:25'),(67,261,3,800.00,800.00,'2026-04-30','2026-04-30 22:35:25'),(68,261,4,600.00,600.00,'2026-04-30','2026-04-30 22:35:25'),(69,261,5,400.00,400.00,'2026-04-30','2026-04-30 22:35:25'),(70,261,6,200.00,200.00,'2026-04-30','2026-04-30 22:35:25'),(71,261,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:25'),(72,261,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:25'),(73,262,1,1100.00,1100.00,'2026-04-30','2026-04-30 22:35:25'),(74,262,2,900.00,900.00,'2026-04-30','2026-04-30 22:35:25'),(75,262,3,700.00,700.00,'2026-04-30','2026-04-30 22:35:25'),(76,262,4,500.00,500.00,'2026-04-30','2026-04-30 22:35:25'),(77,262,5,300.00,300.00,'2026-04-30','2026-04-30 22:35:25'),(78,262,6,100.00,100.00,'2026-04-30','2026-04-30 22:35:25'),(79,262,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(80,262,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(81,263,1,1000.00,1000.00,'2026-04-30','2026-04-30 22:35:26'),(82,263,2,800.00,800.00,'2026-04-30','2026-04-30 22:35:26'),(83,263,3,600.00,600.00,'2026-04-30','2026-04-30 22:35:26'),(84,263,4,400.00,400.00,'2026-04-30','2026-04-30 22:35:26'),(85,263,5,200.00,200.00,'2026-04-30','2026-04-30 22:35:26'),(86,263,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(87,263,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(88,263,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(89,264,1,900.00,900.00,'2026-04-30','2026-04-30 22:35:26'),(90,264,2,700.00,700.00,'2026-04-30','2026-04-30 22:35:26'),(91,264,3,500.00,500.00,'2026-04-30','2026-04-30 22:35:26'),(92,264,4,300.00,300.00,'2026-04-30','2026-04-30 22:35:26'),(93,264,5,100.00,100.00,'2026-04-30','2026-04-30 22:35:26'),(94,264,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(95,264,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(96,264,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(97,265,1,800.00,800.00,'2026-04-30','2026-04-30 22:35:26'),(98,265,2,600.00,600.00,'2026-04-30','2026-04-30 22:35:26'),(99,265,3,400.00,400.00,'2026-04-30','2026-04-30 22:35:26'),(100,265,4,200.00,200.00,'2026-04-30','2026-04-30 22:35:26'),(101,265,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(102,265,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(103,265,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(104,265,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(105,266,1,700.00,700.00,'2026-04-30','2026-04-30 22:35:26'),(106,266,2,500.00,500.00,'2026-04-30','2026-04-30 22:35:26'),(107,266,3,300.00,300.00,'2026-04-30','2026-04-30 22:35:26'),(108,266,4,100.00,100.00,'2026-04-30','2026-04-30 22:35:26'),(109,266,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(110,266,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(111,266,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(112,266,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(113,267,1,600.00,600.00,'2026-04-30','2026-04-30 22:35:26'),(114,267,2,400.00,400.00,'2026-04-30','2026-04-30 22:35:26'),(115,267,3,200.00,200.00,'2026-04-30','2026-04-30 22:35:26'),(116,267,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(117,267,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(118,267,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(119,267,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(120,267,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(121,268,1,500.00,500.00,'2026-04-30','2026-04-30 22:35:26'),(122,268,2,300.00,300.00,'2026-04-30','2026-04-30 22:35:26'),(123,268,3,100.00,100.00,'2026-04-30','2026-04-30 22:35:26'),(124,268,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(125,268,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(126,268,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(127,268,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(128,268,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(129,269,1,400.00,400.00,'2026-04-30','2026-04-30 22:35:26'),(130,269,2,200.00,200.00,'2026-04-30','2026-04-30 22:35:26'),(131,269,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(132,269,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(133,269,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(134,269,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(135,269,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(136,269,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(137,270,1,300.00,300.00,'2026-04-30','2026-04-30 22:35:26'),(138,270,2,100.00,100.00,'2026-04-30','2026-04-30 22:35:26'),(139,270,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(140,270,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(141,270,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(142,270,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(143,270,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(144,270,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(145,271,1,200.00,200.00,'2026-04-30','2026-04-30 22:35:26'),(146,271,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(147,271,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(148,271,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(149,271,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(150,271,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(151,271,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(152,271,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(153,272,1,100.00,100.00,'2026-04-30','2026-04-30 22:35:26'),(154,272,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(155,272,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(156,272,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(157,272,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(158,272,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(159,272,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(160,272,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(161,273,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(162,273,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(163,273,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(164,273,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(165,273,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(166,273,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(167,273,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(168,273,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(169,274,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(170,274,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(171,274,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(172,274,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(173,274,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(174,274,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(175,274,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(176,274,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(177,275,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(178,275,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(179,275,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(180,275,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(181,275,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(182,275,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(183,275,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(184,275,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(185,276,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(186,276,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(187,276,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(188,276,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(189,276,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(190,276,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(191,276,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(192,276,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(193,277,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(194,277,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(195,277,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(196,277,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(197,277,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(198,277,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(199,277,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(200,277,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(201,278,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(202,278,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(203,278,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(204,278,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(205,278,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(206,278,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(207,278,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(208,278,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(209,279,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(210,279,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(211,279,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(212,279,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(213,279,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(214,279,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(215,279,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(216,279,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(217,280,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(218,280,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(219,280,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(220,280,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(221,280,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(222,280,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(223,280,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(224,280,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(225,281,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(226,281,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(227,281,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(228,281,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(229,281,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(230,281,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(231,281,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(232,281,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(233,282,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(234,282,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(235,282,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(236,282,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(237,282,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(238,282,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(239,282,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(240,282,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(241,283,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(242,283,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(243,283,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(244,283,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(245,283,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(246,283,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(247,283,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(248,283,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(249,284,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(250,284,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(251,284,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(252,284,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(253,284,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(254,284,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(255,284,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(256,284,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:26'),(257,285,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(258,285,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(259,285,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(260,285,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(261,285,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(262,285,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(263,285,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(264,285,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(265,286,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(266,286,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(267,286,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(268,286,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(269,286,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(270,286,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(271,286,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(272,286,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(273,287,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(274,287,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(275,287,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(276,287,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(277,287,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(278,287,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(279,287,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(280,287,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(281,288,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(282,288,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(283,288,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(284,288,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(285,288,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(286,288,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(287,288,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(288,288,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(289,289,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(290,289,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(291,289,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(292,289,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(293,289,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(294,289,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(295,289,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(296,289,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(297,290,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(298,290,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(299,290,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(300,290,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(301,290,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(302,290,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(303,290,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(304,290,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(305,291,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(306,291,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(307,291,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(308,291,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(309,291,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(310,291,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(311,291,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(312,291,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(313,292,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(314,292,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(315,292,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(316,292,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(317,292,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(318,292,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(319,292,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(320,292,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(321,293,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(322,293,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(323,293,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(324,293,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(325,293,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(326,293,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(327,293,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(328,293,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(329,294,1,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(330,294,2,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(331,294,3,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(332,294,4,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(333,294,5,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(334,294,6,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(335,294,7,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(336,294,8,50.00,50.00,'2026-04-30','2026-04-30 22:35:27'),(337,295,1,100.00,1.00,'2026-04-30','2026-05-01 07:32:21'),(338,295,2,1.00,1.00,'2026-04-30','2026-05-01 07:32:21'),(339,253,1,1.00,1.00,'2026-05-01','2026-05-01 08:20:45'),(340,253,2,1.00,1.00,'2026-05-01','2026-05-01 08:20:45'),(341,253,3,1.00,1.00,'2026-05-01','2026-05-01 08:20:45'),(342,253,4,1.00,1.00,'2026-05-01','2026-05-01 08:20:45'),(343,253,5,-1.00,-1.00,'2026-05-01','2026-05-01 08:20:45'),(344,253,6,1.00,1.00,'2026-05-01','2026-05-01 08:20:45'),(345,253,7,1.00,1.00,'2026-05-01','2026-05-01 08:20:45'),(346,253,8,1.00,1.00,'2026-05-01','2026-05-01 08:20:45');
/*!40000 ALTER TABLE `price_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_views`
--

DROP TABLE IF EXISTS `price_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_views` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL,
  `brand_id` bigint DEFAULT NULL,
  `view_date` date NOT NULL,
  `view_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `price_views_view_date_brand_id_category_id` (`view_date`,`brand_id`,`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_views`
--

LOCK TABLES `price_views` WRITE;
/*!40000 ALTER TABLE `price_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `price_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prices`
--

DROP TABLE IF EXISTS `prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `condition_id` bigint NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint DEFAULT '1',
  `effective_date` date NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prices_product_id_condition_id_effective_date` (`product_id`,`condition_id`,`effective_date`),
  KEY `condition_id` (`condition_id`),
  CONSTRAINT `prices_ibfk_61` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prices_ibfk_62` FOREIGN KEY (`condition_id`) REFERENCES `product_conditions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2386 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prices`
--

LOCK TABLES `prices` WRITE;
/*!40000 ALTER TABLE `prices` DISABLE KEYS */;
INSERT INTO `prices` VALUES (2017,253,1,3000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2018,253,2,1800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2019,253,3,1600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2020,253,4,1400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2021,253,5,1200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2022,253,6,1000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2023,253,7,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2024,253,8,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2025,254,1,1900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2026,254,2,1700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2027,254,3,1500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2028,254,4,1300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2029,254,5,1100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2030,254,6,900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2031,254,7,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2032,254,8,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2033,255,1,1800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2034,255,2,1600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2035,255,3,1400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2036,255,4,1200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2037,255,5,1000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2038,255,6,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2039,255,7,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2040,255,8,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2041,256,1,1700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2042,256,2,1500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2043,256,3,1300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2044,256,4,1100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2045,256,5,900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2046,256,6,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2047,256,7,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2048,256,8,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2049,257,1,1600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2050,257,2,1400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2051,257,3,1200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2052,257,4,1000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2053,257,5,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2054,257,6,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2055,257,7,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2056,257,8,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2057,258,1,1500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2058,258,2,1300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2059,258,3,1100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2060,258,4,900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2061,258,5,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2062,258,6,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2063,258,7,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2064,258,8,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2065,259,1,1400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2066,259,2,1200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2067,259,3,1000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2068,259,4,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2069,259,5,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2070,259,6,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2071,259,7,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2072,259,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2073,260,1,1300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2074,260,2,1100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2075,260,3,900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2076,260,4,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2077,260,5,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2078,260,6,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2079,260,7,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2080,260,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2081,261,1,1200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2082,261,2,1000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2083,261,3,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2084,261,4,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2085,261,5,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2086,261,6,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2087,261,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2088,261,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2089,262,1,1100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2090,262,2,900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2091,262,3,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2092,262,4,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2093,262,5,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2094,262,6,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:25'),(2095,262,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2096,262,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2097,263,1,1000.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2098,263,2,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2099,263,3,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2100,263,4,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2101,263,5,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2102,263,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2103,263,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2104,263,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2105,264,1,900.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2106,264,2,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2107,264,3,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2108,264,4,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2109,264,5,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2110,264,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2111,264,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2112,264,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2113,265,1,800.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2114,265,2,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2115,265,3,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2116,265,4,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2117,265,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2118,265,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2119,265,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2120,265,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2121,266,1,700.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2122,266,2,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2123,266,3,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2124,266,4,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2125,266,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2126,266,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2127,266,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2128,266,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2129,267,1,600.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2130,267,2,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2131,267,3,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2132,267,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2133,267,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2134,267,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2135,267,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2136,267,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2137,268,1,500.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2138,268,2,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2139,268,3,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2140,268,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2141,268,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2142,268,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2143,268,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2144,268,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2145,269,1,400.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2146,269,2,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2147,269,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2148,269,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2149,269,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2150,269,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2151,269,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2152,269,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2153,270,1,300.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2154,270,2,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2155,270,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2156,270,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2157,270,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2158,270,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2159,270,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2160,270,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2161,271,1,200.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2162,271,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2163,271,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2164,271,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2165,271,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2166,271,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2167,271,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2168,271,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2169,272,1,100.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2170,272,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2171,272,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2172,272,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2173,272,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2174,272,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2175,272,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2176,272,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2177,273,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2178,273,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2179,273,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2180,273,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2181,273,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2182,273,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2183,273,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2184,273,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2185,274,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2186,274,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2187,274,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2188,274,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2189,274,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2190,274,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2191,274,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2192,274,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2193,275,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2194,275,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2195,275,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2196,275,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2197,275,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2198,275,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2199,275,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2200,275,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2201,276,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2202,276,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2203,276,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2204,276,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2205,276,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2206,276,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2207,276,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2208,276,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2209,277,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2210,277,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2211,277,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2212,277,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2213,277,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2214,277,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2215,277,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2216,277,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2217,278,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2218,278,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2219,278,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2220,278,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2221,278,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2222,278,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2223,278,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2224,278,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2225,279,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2226,279,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2227,279,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2228,279,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2229,279,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2230,279,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2231,279,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2232,279,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2233,280,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2234,280,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2235,280,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2236,280,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2237,280,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2238,280,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2239,280,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2240,280,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2241,281,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2242,281,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2243,281,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2244,281,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2245,281,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2246,281,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2247,281,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2248,281,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2249,282,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2250,282,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2251,282,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2252,282,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2253,282,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2254,282,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2255,282,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2256,282,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2257,283,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2258,283,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2259,283,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2260,283,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2261,283,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2262,283,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2263,283,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2264,283,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2265,284,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2266,284,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2267,284,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2268,284,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2269,284,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2270,284,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2271,284,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:26'),(2272,284,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2273,285,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2274,285,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2275,285,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2276,285,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2277,285,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2278,285,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2279,285,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2280,285,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2281,286,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2282,286,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2283,286,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2284,286,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2285,286,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2286,286,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2287,286,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2288,286,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2289,287,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2290,287,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2291,287,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2292,287,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2293,287,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2294,287,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2295,287,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2296,287,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2297,288,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2298,288,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2299,288,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2300,288,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2301,288,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2302,288,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2303,288,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2304,288,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2305,289,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2306,289,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2307,289,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2308,289,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2309,289,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2310,289,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2311,289,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2312,289,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2313,290,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2314,290,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2315,290,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2316,290,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2317,290,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2318,290,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2319,290,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2320,290,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2321,291,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2322,291,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2323,291,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2324,291,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2325,291,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2326,291,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2327,291,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2328,291,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2329,292,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2330,292,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2331,292,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2332,292,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2333,292,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2334,292,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2335,292,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2336,292,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2337,293,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2338,293,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2339,293,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2340,293,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2341,293,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2342,293,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2343,293,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2344,293,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2345,294,1,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2346,294,2,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2347,294,3,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2348,294,4,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2349,294,5,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2350,294,6,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2351,294,7,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2352,294,8,50.00,1,'2026-04-30','2026-04-30 21:07:57','2026-04-30 22:35:27'),(2353,295,1,1.00,1,'2026-04-30','2026-05-01 07:16:44','2026-05-01 07:32:21'),(2354,295,2,1.00,1,'2026-04-30','2026-05-01 07:17:27','2026-05-01 07:32:21'),(2355,295,3,1.00,1,'2026-04-30','2026-05-01 07:32:21','2026-05-01 07:32:21'),(2356,295,4,1.00,1,'2026-04-30','2026-05-01 07:32:21','2026-05-01 07:32:21'),(2357,295,5,1.00,1,'2026-04-30','2026-05-01 07:32:21','2026-05-01 07:32:21'),(2358,295,6,1.00,1,'2026-04-30','2026-05-01 07:32:21','2026-05-01 07:32:21'),(2359,295,7,1.00,1,'2026-04-30','2026-05-01 07:32:21','2026-05-01 07:32:21'),(2360,295,8,1.00,1,'2026-04-30','2026-05-01 07:32:21','2026-05-01 07:32:21'),(2361,253,1,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2362,253,2,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2363,253,3,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2364,253,4,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2365,253,5,-1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2366,253,6,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2367,253,7,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2368,253,8,1.00,1,'2026-05-01','2026-05-01 08:19:44','2026-05-01 08:20:45'),(2369,254,1,13123.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2370,254,2,123123.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2371,254,3,123213.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2372,254,4,12312.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2373,254,5,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2374,254,6,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2375,254,7,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2376,254,8,21312312.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2377,255,1,42323.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2378,255,2,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2379,255,3,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2380,255,4,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2381,255,5,1244123.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2382,255,6,12321.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2383,255,7,123213.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2384,255,8,12312.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45'),(2385,256,8,12312.00,1,'2026-05-01','2026-05-01 08:20:45','2026-05-01 08:20:45');
/*!40000 ALTER TABLE `prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_conditions`
--

DROP TABLE IF EXISTS `product_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_conditions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`),
  UNIQUE KEY `code_15` (`code`),
  UNIQUE KEY `code_16` (`code`),
  UNIQUE KEY `code_17` (`code`),
  UNIQUE KEY `code_18` (`code`),
  UNIQUE KEY `code_19` (`code`),
  UNIQUE KEY `code_20` (`code`),
  UNIQUE KEY `code_21` (`code`),
  UNIQUE KEY `code_22` (`code`),
  UNIQUE KEY `code_23` (`code`),
  UNIQUE KEY `code_24` (`code`),
  UNIQUE KEY `code_25` (`code`),
  UNIQUE KEY `code_26` (`code`),
  UNIQUE KEY `code_27` (`code`),
  UNIQUE KEY `code_28` (`code`),
  UNIQUE KEY `code_29` (`code`),
  UNIQUE KEY `code_30` (`code`),
  UNIQUE KEY `code_31` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_conditions`
--

LOCK TABLES `product_conditions` WRITE;
/*!40000 ALTER TABLE `product_conditions` DISABLE KEYS */;
INSERT INTO `product_conditions` VALUES (1,'开机屏好','screen_good','开机且屏幕完好',1),(2,'开机大屏好','big_screen_good','开机且大屏完好',2),(3,'开机小屏好','small_screen_good','开机且小屏完好',3),(4,'开机屏坏','screen_broken','开机但屏幕损坏',4),(5,'不开机','no_power','无法开机',5),(6,'废板整机','dead_board','主板损坏无法开机的完整机器',6),(7,'开机屏好外屏碎','screen_good_outer_cracked','开机屏好但外屏碎裂',7),(8,'开机坏未拆标','broken_no_tamper','开机坏且未拆标',8);
/*!40000 ALTER TABLE `product_conditions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `brand_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `model_code` varchar(50) DEFAULT NULL,
  `series_name` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text,
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_61` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_62` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=296 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (253,1,1,'iPhone 15 Pro Max','MODEL10','iPhone','https://via.placeholder.com/300x300.png?text=iPhone%2015%20Pro%20Max','iPhone 15 Pro Max智能手机，配置先进，性能强劲',1,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(254,1,1,'iPhone 15 Pro','MODEL11','iPhone','https://via.placeholder.com/300x300.png?text=iPhone%2015%20Pro','iPhone 15 Pro智能手机，配置先进，性能强劲',2,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(255,1,1,'iPhone 15','MODEL12','iPhone','https://via.placeholder.com/300x300.png?text=iPhone%2015','iPhone 15智能手机，配置先进，性能强劲',3,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(256,1,1,'iPhone 14 Pro Max','MODEL13','iPhone','https://via.placeholder.com/300x300.png?text=iPhone%2014%20Pro%20Max','iPhone 14 Pro Max智能手机，配置先进，性能强劲',4,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(257,1,1,'iPhone 14','MODEL14','iPhone','https://via.placeholder.com/300x300.png?text=iPhone%2014','iPhone 14智能手机，配置先进，性能强劲',5,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(258,1,1,'iPhone 13','MODEL15','iPhone','https://via.placeholder.com/300x300.png?text=iPhone%2013','iPhone 13智能手机，配置先进，性能强劲',6,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(259,2,1,'Mate 60 Pro','MODEL20','Mate','https://via.placeholder.com/300x300.png?text=Mate%2060%20Pro','Mate 60 Pro智能手机，配置先进，性能强劲',7,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(260,2,1,'Mate 60','MODEL21','Mate','https://via.placeholder.com/300x300.png?text=Mate%2060','Mate 60智能手机，配置先进，性能强劲',8,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(261,2,1,'P60 Pro','MODEL22','P60','https://via.placeholder.com/300x300.png?text=P60%20Pro','P60 Pro智能手机，配置先进，性能强劲',9,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(262,2,1,'P50','MODEL23','P50','https://via.placeholder.com/300x300.png?text=P50','P50智能手机，配置先进，性能强劲',10,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(263,2,1,'nova 11','MODEL24','nova','https://via.placeholder.com/300x300.png?text=nova%2011','nova 11智能手机，配置先进，性能强劲',11,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(264,2,1,'Mate 40 Pro','MODEL25','Mate','https://via.placeholder.com/300x300.png?text=Mate%2040%20Pro','Mate 40 Pro智能手机，配置先进，性能强劲',12,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(265,3,1,'Xiaomi 14 Ultra','MODEL30','Xiaomi','https://via.placeholder.com/300x300.png?text=Xiaomi%2014%20Ultra','Xiaomi 14 Ultra智能手机，配置先进，性能强劲',13,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(266,3,1,'Xiaomi 14 Pro','MODEL31','Xiaomi','https://via.placeholder.com/300x300.png?text=Xiaomi%2014%20Pro','Xiaomi 14 Pro智能手机，配置先进，性能强劲',14,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(267,3,1,'Xiaomi 14','MODEL32','Xiaomi','https://via.placeholder.com/300x300.png?text=Xiaomi%2014','Xiaomi 14智能手机，配置先进，性能强劲',15,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(268,3,1,'Xiaomi 13 Pro','MODEL33','Xiaomi','https://via.placeholder.com/300x300.png?text=Xiaomi%2013%20Pro','Xiaomi 13 Pro智能手机，配置先进，性能强劲',16,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(269,3,1,'Redmi K70 Pro','MODEL34','Redmi','https://via.placeholder.com/300x300.png?text=Redmi%20K70%20Pro','Redmi K70 Pro智能手机，配置先进，性能强劲',17,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(270,3,1,'Redmi Note 13 Pro','MODEL35','Redmi','https://via.placeholder.com/300x300.png?text=Redmi%20Note%2013%20Pro','Redmi Note 13 Pro智能手机，配置先进，性能强劲',18,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(271,4,1,'Galaxy S24 Ultra','MODEL40','Galaxy','https://via.placeholder.com/300x300.png?text=Galaxy%20S24%20Ultra','Galaxy S24 Ultra智能手机，配置先进，性能强劲',19,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(272,4,1,'Galaxy S24+','MODEL41','Galaxy','https://via.placeholder.com/300x300.png?text=Galaxy%20S24%2B','Galaxy S24+智能手机，配置先进，性能强劲',20,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(273,4,1,'Galaxy S24','MODEL42','Galaxy','https://via.placeholder.com/300x300.png?text=Galaxy%20S24','Galaxy S24智能手机，配置先进，性能强劲',21,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(274,4,1,'Galaxy Z Fold5','MODEL43','Galaxy','https://via.placeholder.com/300x300.png?text=Galaxy%20Z%20Fold5','Galaxy Z Fold5智能手机，配置先进，性能强劲',22,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(275,4,1,'Galaxy Z Flip5','MODEL44','Galaxy','https://via.placeholder.com/300x300.png?text=Galaxy%20Z%20Flip5','Galaxy Z Flip5智能手机，配置先进，性能强劲',23,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(276,4,1,'Galaxy S23','MODEL45','Galaxy','https://via.placeholder.com/300x300.png?text=Galaxy%20S23','Galaxy S23智能手机，配置先进，性能强劲',24,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(277,5,1,'Find X7 Ultra','MODEL50','Find','https://via.placeholder.com/300x300.png?text=Find%20X7%20Ultra','Find X7 Ultra智能手机，配置先进，性能强劲',25,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(278,5,1,'Find X7 Pro','MODEL51','Find','https://via.placeholder.com/300x300.png?text=Find%20X7%20Pro','Find X7 Pro智能手机，配置先进，性能强劲',26,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(279,5,1,'Find X6 Pro','MODEL52','Find','https://via.placeholder.com/300x300.png?text=Find%20X6%20Pro','Find X6 Pro智能手机，配置先进，性能强劲',27,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(280,5,1,'Reno 11 Pro','MODEL53','Reno','https://via.placeholder.com/300x300.png?text=Reno%2011%20Pro','Reno 11 Pro智能手机，配置先进，性能强劲',28,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(281,5,1,'Reno 11','MODEL54','Reno','https://via.placeholder.com/300x300.png?text=Reno%2011','Reno 11智能手机，配置先进，性能强劲',29,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(282,5,1,'Find X5 Pro','MODEL55','Find','https://via.placeholder.com/300x300.png?text=Find%20X5%20Pro','Find X5 Pro智能手机，配置先进，性能强劲',30,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(283,6,1,'X100 Pro','MODEL60','X100','https://via.placeholder.com/300x300.png?text=X100%20Pro','X100 Pro智能手机，配置先进，性能强劲',31,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(284,6,1,'X100','MODEL61','X100','https://via.placeholder.com/300x300.png?text=X100','X100智能手机，配置先进，性能强劲',32,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(285,6,1,'X90 Pro+','MODEL62','X90','https://via.placeholder.com/300x300.png?text=X90%20Pro%2B','X90 Pro+智能手机，配置先进，性能强劲',33,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(286,6,1,'X90 Pro','MODEL63','X90','https://via.placeholder.com/300x300.png?text=X90%20Pro','X90 Pro智能手机，配置先进，性能强劲',34,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(287,6,1,'X80 Pro','MODEL64','X80','https://via.placeholder.com/300x300.png?text=X80%20Pro','X80 Pro智能手机，配置先进，性能强劲',35,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(288,6,1,'V29 Pro','MODEL65','V29','https://via.placeholder.com/300x300.png?text=V29%20Pro','V29 Pro智能手机，配置先进，性能强劲',36,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(289,7,1,'Find N3','MODEL70','Find','https://via.placeholder.com/300x300.png?text=Find%20N3','Find N3智能手机，配置先进，性能强劲',37,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(290,7,1,'Find N2','MODEL71','Find','https://via.placeholder.com/300x300.png?text=Find%20N2','Find N2智能手机，配置先进，性能强劲',38,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(291,7,1,'Reno 10 Pro+','MODEL72','Reno','https://via.placeholder.com/300x300.png?text=Reno%2010%20Pro%2B','Reno 10 Pro+智能手机，配置先进，性能强劲',39,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(292,7,1,'K11','MODEL73','K11','https://via.placeholder.com/300x300.png?text=K11','K11智能手机，配置先进，性能强劲',40,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(293,7,1,'A98','MODEL74','A98','https://via.placeholder.com/300x300.png?text=A98','A98智能手机，配置先进，性能强劲',41,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(294,7,1,'A78','MODEL75','A78','https://via.placeholder.com/300x300.png?text=A78','A78智能手机，配置先进，性能强劲',42,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(295,39,1,'的','1','的',NULL,NULL,0,1,'2026-05-01 07:08:44','2026-05-01 07:08:44');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permissions_permission_id_role_id_unique` (`role_id`,`permission_id`),
  UNIQUE KEY `role_permissions_role_id_permission_id` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_61` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permissions_ibfk_62` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`),
  UNIQUE KEY `code_15` (`code`),
  UNIQUE KEY `code_16` (`code`),
  UNIQUE KEY `code_17` (`code`),
  UNIQUE KEY `code_18` (`code`),
  UNIQUE KEY `code_19` (`code`),
  UNIQUE KEY `code_20` (`code`),
  UNIQUE KEY `code_21` (`code`),
  UNIQUE KEY `code_22` (`code`),
  UNIQUE KEY `code_23` (`code`),
  UNIQUE KEY `code_24` (`code`),
  UNIQUE KEY `code_25` (`code`),
  UNIQUE KEY `code_26` (`code`),
  UNIQUE KEY `code_27` (`code`),
  UNIQUE KEY `code_28` (`code`),
  UNIQUE KEY `code_29` (`code`),
  UNIQUE KEY `code_30` (`code`),
  UNIQUE KEY `code_31` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'超级管理员','super_admin','拥有所有权限','2026-04-27 21:47:02','2026-04-27 21:47:02'),(2,'管理员','admin','拥有大部分管理权限','2026-04-27 21:47:02','2026-04-27 21:47:02'),(3,'运营人员','operator','拥有内容运营权限','2026-04-27 21:47:02','2026-04-27 21:47:02');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `key` varchar(50) NOT NULL,
  `value` text,
  `description` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `key_2` (`key`),
  UNIQUE KEY `key_3` (`key`),
  UNIQUE KEY `key_4` (`key`),
  UNIQUE KEY `key_5` (`key`),
  UNIQUE KEY `key_6` (`key`),
  UNIQUE KEY `key_7` (`key`),
  UNIQUE KEY `key_8` (`key`),
  UNIQUE KEY `key_9` (`key`),
  UNIQUE KEY `key_10` (`key`),
  UNIQUE KEY `key_11` (`key`),
  UNIQUE KEY `key_12` (`key`),
  UNIQUE KEY `key_13` (`key`),
  UNIQUE KEY `key_14` (`key`),
  UNIQUE KEY `key_15` (`key`),
  UNIQUE KEY `key_16` (`key`),
  UNIQUE KEY `key_17` (`key`),
  UNIQUE KEY `key_18` (`key`),
  UNIQUE KEY `key_19` (`key`),
  UNIQUE KEY `key_20` (`key`),
  UNIQUE KEY `key_21` (`key`),
  UNIQUE KEY `key_22` (`key`),
  UNIQUE KEY `key_23` (`key`),
  UNIQUE KEY `key_24` (`key`),
  UNIQUE KEY `key_25` (`key`),
  UNIQUE KEY `key_26` (`key`),
  UNIQUE KEY `key_27` (`key`),
  UNIQUE KEY `key_28` (`key`),
  UNIQUE KEY `key_29` (`key`),
  UNIQUE KEY `key_30` (`key`),
  UNIQUE KEY `key_31` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'receiver_name','陈约','收件人姓名','2026-04-27 21:47:02','2026-04-27 21:47:02'),(2,'receiver_phone','15361862828','收款电话(微信同号)','2026-04-27 21:47:02','2026-04-27 21:47:02'),(3,'receiver_address','广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B','收货地址','2026-04-27 21:47:02','2026-04-27 21:47:02'),(4,'service_phone','15361862828','客服电话','2026-04-27 21:47:02','2026-04-27 21:47:02'),(5,'service_wechat','15361862828','客服微信','2026-04-27 21:47:02','2026-04-27 21:47:02'),(6,'membership_phone','16618180111','会员服务电话','2026-04-27 21:47:02','2026-04-27 21:47:02'),(7,'free_scan_count','10','免费拍照查价次数','2026-04-27 21:47:02','2026-04-27 21:47:02'),(8,'sign_points','5','每日签到积分','2026-04-27 21:47:02','2026-04-27 21:47:02'),(9,'quote_page_title','撒打发',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24'),(10,'quote_view_count','12313',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24'),(11,'quote_receiver_name','撒旦飞洒的',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24'),(12,'quote_receiver_phone','打发士大夫',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24'),(13,'quote_receiver_address','阿斯顿发大水的',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24'),(14,'quote_rules','[\"阿斯蒂芬撒旦\"]',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24'),(15,'quote_footer_notes','[\"阿斯蒂芬撒旦\"]',NULL,'2026-04-30 22:47:24','2026-04-30 22:47:24');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact_name` varchar(50) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `wechat` varchar(50) DEFAULT NULL,
  `province` varchar(30) DEFAULT NULL,
  `city` varchar(30) DEFAULT NULL,
  `district` varchar(30) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `business_hours` varchar(100) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'安徽门店','范凯旋','18755875222','15361862828','安徽省','阜阳市','颍州区','安徽省阜阳市颍州区双子塔写字楼 A 座',33.1624000,115.6218000,NULL,1,1,'2026-04-27 21:47:02','2026-04-27 21:47:02');
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stock`
--

DROP TABLE IF EXISTS `user_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stock` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `purchase_price` decimal(10,2) DEFAULT NULL COMMENT '购入价格',
  `condition_id` bigint DEFAULT NULL COMMENT '成色ID',
  `note` varchar(500) DEFAULT NULL COMMENT '备注',
  `is_sold` tinyint(1) DEFAULT '0' COMMENT '是否已卖出',
  `sold_price` decimal(10,2) DEFAULT NULL COMMENT '卖出价格',
  `sold_at` datetime DEFAULT NULL COMMENT '卖出时间',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stock`
--

LOCK TABLES `user_stock` WRITE;
/*!40000 ALTER TABLE `user_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `openid` varchar(64) DEFAULT NULL,
  `union_id` varchar(64) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `user_no` varchar(20) DEFAULT NULL,
  `points` int DEFAULT '0',
  `scan_remaining` int DEFAULT '10',
  `membership_id` bigint DEFAULT NULL,
  `membership_expire` datetime DEFAULT NULL,
  `total_recycled` int DEFAULT '0',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `co2_saved` decimal(8,2) DEFAULT '0.00',
  `status` tinyint DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`),
  UNIQUE KEY `user_no` (`user_no`),
  UNIQUE KEY `openid_2` (`openid`),
  UNIQUE KEY `user_no_2` (`user_no`),
  UNIQUE KEY `openid_3` (`openid`),
  UNIQUE KEY `user_no_3` (`user_no`),
  UNIQUE KEY `openid_4` (`openid`),
  UNIQUE KEY `user_no_4` (`user_no`),
  UNIQUE KEY `openid_5` (`openid`),
  UNIQUE KEY `user_no_5` (`user_no`),
  UNIQUE KEY `openid_6` (`openid`),
  UNIQUE KEY `user_no_6` (`user_no`),
  UNIQUE KEY `openid_7` (`openid`),
  UNIQUE KEY `user_no_7` (`user_no`),
  UNIQUE KEY `openid_8` (`openid`),
  UNIQUE KEY `user_no_8` (`user_no`),
  UNIQUE KEY `openid_9` (`openid`),
  UNIQUE KEY `user_no_9` (`user_no`),
  UNIQUE KEY `openid_10` (`openid`),
  UNIQUE KEY `user_no_10` (`user_no`),
  UNIQUE KEY `openid_11` (`openid`),
  UNIQUE KEY `user_no_11` (`user_no`),
  UNIQUE KEY `openid_12` (`openid`),
  UNIQUE KEY `user_no_12` (`user_no`),
  UNIQUE KEY `openid_13` (`openid`),
  UNIQUE KEY `user_no_13` (`user_no`),
  UNIQUE KEY `openid_14` (`openid`),
  UNIQUE KEY `user_no_14` (`user_no`),
  UNIQUE KEY `openid_15` (`openid`),
  UNIQUE KEY `user_no_15` (`user_no`),
  UNIQUE KEY `openid_16` (`openid`),
  UNIQUE KEY `user_no_16` (`user_no`),
  UNIQUE KEY `openid_17` (`openid`),
  UNIQUE KEY `user_no_17` (`user_no`),
  UNIQUE KEY `openid_18` (`openid`),
  UNIQUE KEY `user_no_18` (`user_no`),
  UNIQUE KEY `openid_19` (`openid`),
  UNIQUE KEY `user_no_19` (`user_no`),
  UNIQUE KEY `openid_20` (`openid`),
  UNIQUE KEY `user_no_20` (`user_no`),
  UNIQUE KEY `openid_21` (`openid`),
  UNIQUE KEY `user_no_21` (`user_no`),
  UNIQUE KEY `openid_22` (`openid`),
  UNIQUE KEY `user_no_22` (`user_no`),
  UNIQUE KEY `openid_23` (`openid`),
  UNIQUE KEY `user_no_23` (`user_no`),
  UNIQUE KEY `openid_24` (`openid`),
  UNIQUE KEY `user_no_24` (`user_no`),
  UNIQUE KEY `openid_25` (`openid`),
  UNIQUE KEY `user_no_25` (`user_no`),
  UNIQUE KEY `openid_26` (`openid`),
  UNIQUE KEY `user_no_26` (`user_no`),
  UNIQUE KEY `openid_27` (`openid`),
  UNIQUE KEY `user_no_27` (`user_no`),
  UNIQUE KEY `openid_28` (`openid`),
  UNIQUE KEY `user_no_28` (`user_no`),
  UNIQUE KEY `openid_29` (`openid`),
  UNIQUE KEY `user_no_29` (`user_no`),
  UNIQUE KEY `openid_30` (`openid`),
  UNIQUE KEY `user_no_30` (`user_no`),
  UNIQUE KEY `openid_31` (`openid`),
  UNIQUE KEY `user_no_31` (`user_no`),
  UNIQUE KEY `openid_32` (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=291 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (268,'test_openid_1_1777554477924','test_union_1','13800000001','用户1','https://api.dicebear.com/7.x/avataaars/svg?seed=1','UT000001',476,5,NULL,NULL,48,8543.00,30.00,1,'2026-04-26 10:46:57','2026-04-03 15:54:05','2026-04-30 21:07:57'),(269,'test_openid_2_1777554477924','test_union_2','13800000002','用户2','https://api.dicebear.com/7.x/avataaars/svg?seed=2','UT000002',737,23,NULL,NULL,39,4563.00,101.00,1,'2026-04-30 04:42:50','2026-04-04 10:51:14','2026-04-30 21:07:57'),(270,'test_openid_3_1777554477924','test_union_3','13800000003','用户3','https://api.dicebear.com/7.x/avataaars/svg?seed=3','UT000003',821,23,3,'2026-05-30 21:07:57',29,7437.00,32.00,1,'2026-04-28 21:00:30','2026-04-23 10:54:35','2026-04-30 21:07:57'),(271,'test_openid_4_1777554477924','test_union_4','13800000004','用户4','https://api.dicebear.com/7.x/avataaars/svg?seed=4','UT000004',311,15,NULL,NULL,31,5167.00,58.00,1,'2026-04-27 03:48:50','2026-04-24 13:08:04','2026-04-30 21:07:57'),(272,'test_openid_5_1777554477924','test_union_5','13800000005','用户5','https://api.dicebear.com/7.x/avataaars/svg?seed=5','UT000005',720,15,NULL,NULL,33,2661.00,17.00,1,'2026-04-30 17:04:05','2026-04-15 18:39:32','2026-04-30 21:07:57'),(273,'test_openid_6_1777554477924','test_union_6','13800000006','用户6','https://api.dicebear.com/7.x/avataaars/svg?seed=6','UT000006',964,16,6,'2026-05-30 21:07:57',34,7284.00,109.00,1,'2026-04-27 16:55:53','2026-04-02 04:11:25','2026-04-30 21:07:57'),(274,'test_openid_7_1777554477924','test_union_7','13800000007','用户7','https://api.dicebear.com/7.x/avataaars/svg?seed=7','UT000007',972,19,NULL,NULL,4,5926.00,53.00,1,'2026-04-29 19:09:02','2026-04-08 07:24:52','2026-04-30 21:07:57'),(275,'test_openid_8_1777554477924','test_union_8','13800000008','用户8','https://api.dicebear.com/7.x/avataaars/svg?seed=8','UT000008',750,9,NULL,NULL,24,9226.00,98.00,1,'2026-04-25 09:43:06','2026-03-31 23:07:57','2026-04-30 21:07:57'),(276,'test_openid_9_1777554477924','test_union_9','13800000009','用户9','https://api.dicebear.com/7.x/avataaars/svg?seed=9','UT000009',437,21,9,'2026-05-30 21:07:57',41,2805.00,83.00,1,'2026-04-28 04:38:05','2026-04-09 16:47:40','2026-04-30 21:07:57'),(277,'test_openid_10_1777554477924','test_union_10','13800000010','用户10','https://api.dicebear.com/7.x/avataaars/svg?seed=10','UT000010',1047,15,NULL,NULL,11,5145.00,59.00,1,'2026-04-25 21:09:33','2026-04-05 20:38:10','2026-04-30 21:07:57'),(278,'test_openid_11_1777554477924','test_union_11','13800000011','用户11','https://api.dicebear.com/7.x/avataaars/svg?seed=11','UT000011',910,16,NULL,NULL,47,6245.00,50.00,1,'2026-04-28 19:07:43','2026-04-28 01:19:38','2026-04-30 21:07:57'),(279,'test_openid_12_1777554477924','test_union_12','13800000012','用户12','https://api.dicebear.com/7.x/avataaars/svg?seed=12','UT000012',839,9,12,'2026-05-30 21:07:57',4,8688.00,35.00,1,'2026-04-24 17:09:52','2026-04-15 09:17:22','2026-04-30 21:07:57'),(280,'test_openid_13_1777554477924','test_union_13','13800000013','用户13','https://api.dicebear.com/7.x/avataaars/svg?seed=13','UT000013',298,6,NULL,NULL,41,9627.00,11.00,1,'2026-04-25 09:08:44','2026-04-20 12:18:41','2026-04-30 21:07:57'),(281,'test_openid_14_1777554477924','test_union_14','13800000014','用户14','https://api.dicebear.com/7.x/avataaars/svg?seed=14','UT000014',183,13,NULL,NULL,16,2745.00,11.00,1,'2026-04-25 23:35:14','2026-04-09 21:41:02','2026-04-30 21:07:57'),(282,'test_openid_15_1777554477924','test_union_15','13800000015','用户15','https://api.dicebear.com/7.x/avataaars/svg?seed=15','UT000015',466,22,15,'2026-05-30 21:07:57',13,1910.00,22.00,1,'2026-04-29 15:25:28','2026-04-18 22:33:26','2026-04-30 21:07:57'),(283,'test_openid_16_1777554477924','test_union_16','13800000016','用户16','https://api.dicebear.com/7.x/avataaars/svg?seed=16','UT000016',532,17,NULL,NULL,34,4853.00,12.00,1,'2026-04-28 19:21:43','2026-04-14 15:27:46','2026-04-30 21:07:57'),(284,'test_openid_17_1777554477924','test_union_17','13800000017','用户17','https://api.dicebear.com/7.x/avataaars/svg?seed=17','UT000017',679,15,NULL,NULL,36,4245.00,84.00,1,'2026-04-26 11:52:55','2026-04-03 15:31:22','2026-04-30 21:07:57'),(285,'test_openid_18_1777554477924','test_union_18','13800000018','用户18','https://api.dicebear.com/7.x/avataaars/svg?seed=18','UT000018',120,12,18,'2026-05-30 21:07:57',3,9682.00,46.00,1,'2026-04-25 16:41:31','2026-04-10 06:58:03','2026-04-30 21:07:57'),(286,'test_openid_19_1777554477924','test_union_19','13800000019','用户19','https://api.dicebear.com/7.x/avataaars/svg?seed=19','UT000019',875,9,NULL,NULL,48,9013.00,22.00,1,'2026-04-28 11:50:07','2026-04-21 23:12:06','2026-04-30 21:07:57'),(287,'test_openid_20_1777554477924','test_union_20','13800000020','用户20','https://api.dicebear.com/7.x/avataaars/svg?seed=20','UT000020',759,21,NULL,NULL,11,2729.00,64.00,1,'2026-04-29 13:06:00','2026-04-14 17:04:29','2026-04-30 21:07:57'),(288,NULL,NULL,'18666207136','用户7136','/images/icons/avatar.svg','3373413',0,10,NULL,NULL,0,0.00,0.00,1,'2026-04-30 23:46:12','2026-04-30 21:34:20','2026-04-30 23:46:12'),(289,NULL,NULL,'13800138001','用户8001','/images/icons/avatar.svg','1020331',0,10,NULL,NULL,0,0.00,0.00,1,'2026-04-30 23:53:52','2026-04-30 22:17:17','2026-04-30 23:53:52'),(290,'o0Ghu5FGPny7eF7NxddDuBPHASLU',NULL,NULL,'微信用户','/images/icons/avatar.svg','6793138',0,10,NULL,NULL,0,0.00,0.00,1,NULL,'2026-05-01 08:41:14','2026-05-01 08:41:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (1,'iPhone 回收流程演示',NULL,'https://via.placeholder.com/640x360.png?text=iPhone回收','https://example.com/videos/iphone-recycle.mp4',180,1,1,'2026-04-28 21:09:25','2026-04-28 21:09:25'),(2,'华为手机高价回收技巧',NULL,'https://via.placeholder.com/640x360.png?text=华为回收','https://example.com/videos/huawei-tips.mp4',240,2,1,'2026-04-28 21:09:25','2026-04-28 21:09:25'),(4,'iPhone 回收流程演示',NULL,'https://via.placeholder.com/640x360.png?text=iPhone回收','https://example.com/videos/iphone-recycle.mp4',180,1,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(5,'华为手机高价回收技巧',NULL,'https://via.placeholder.com/640x360.png?text=华为回收','https://example.com/videos/huawei-tips.mp4',240,2,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(6,'环保知识小课堂',NULL,'https://via.placeholder.com/640x360.png?text=环保知识','https://example.com/videos/eco-class.mp4',300,3,1,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(7,'的发生','实用功能','http://localhost:3000/uploads/1777592295323-qezfukwn0.png','http://localhost:3000/uploads/videos/1777592298631-9nskfqhyo.mp4',NULL,1,1,'2026-05-01 07:38:22','2026-05-01 07:38:22');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_logs`
--

DROP TABLE IF EXISTS `wallet_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `type` tinyint DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `balance_after` decimal(12,2) DEFAULT NULL,
  `source` varchar(30) DEFAULT NULL,
  `source_id` varchar(50) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `wallet_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=612 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_logs`
--

LOCK TABLES `wallet_logs` WRITE;
/*!40000 ALTER TABLE `wallet_logs` DISABLE KEYS */;
INSERT INTO `wallet_logs` VALUES (536,268,1,66.00,1722.00,'recycle','recycle_1777554477945_u47j112k0','回收订单收入','2026-04-26 05:50:45'),(537,268,3,220.00,226.00,'refund','refund_1777554477945_ply69qlhc','订单退款','2026-04-20 00:34:38'),(538,268,1,170.00,608.00,'recycle','recycle_1777554477945_88rhv85i6','回收订单收入','2026-04-16 23:50:52'),(539,268,2,237.00,580.00,'withdraw','withdraw_1777554477945_6ftqzjsnh','提现','2026-04-19 09:01:27'),(540,269,3,162.00,899.00,'refund','refund_1777554477945_nyfurpgn4','订单退款','2026-04-26 12:41:02'),(541,269,4,257.00,2237.00,'bonus','bonus_1777554477945_6i1zeguxv','活动奖励','2026-04-30 07:46:37'),(542,269,2,76.00,1848.00,'withdraw','withdraw_1777554477945_grlc6vz8m','提现','2026-04-22 21:05:38'),(543,270,3,227.00,2062.00,'refund','refund_1777554477945_r804g1tbp','订单退款','2026-04-20 21:47:01'),(544,270,2,228.00,1495.00,'withdraw','withdraw_1777554477945_nchsp2k42','提现','2026-04-24 17:00:23'),(545,270,1,262.00,922.00,'recycle','recycle_1777554477945_f5ibakfdb','回收订单收入','2026-04-17 07:58:52'),(546,271,3,167.00,1291.00,'refund','refund_1777554477945_nxjw7l29s','订单退款','2026-04-26 17:53:26'),(547,271,4,186.00,999.00,'bonus','bonus_1777554477945_y6kpr4x7k','活动奖励','2026-04-30 03:24:55'),(548,272,4,173.00,1608.00,'bonus','bonus_1777554477945_53vgrp9x5','活动奖励','2026-04-25 21:31:53'),(549,272,3,286.00,1031.00,'refund','refund_1777554477945_i0qrwkt26','订单退款','2026-04-25 13:33:33'),(550,272,2,82.00,607.00,'withdraw','withdraw_1777554477945_l92vhu6am','提现','2026-04-25 19:04:08'),(551,272,4,276.00,829.00,'bonus','bonus_1777554477945_udq404vcu','活动奖励','2026-04-27 05:04:04'),(552,272,4,262.00,870.00,'bonus','bonus_1777554477945_7kpxeikmr','活动奖励','2026-04-20 17:23:49'),(553,273,2,228.00,2156.00,'withdraw','withdraw_1777554477945_1r7qa262y','提现','2026-04-24 23:24:30'),(554,273,3,72.00,1338.00,'refund','refund_1777554477945_20gzomrwn','订单退款','2026-04-26 09:23:40'),(555,273,3,295.00,2095.00,'refund','refund_1777554477945_oodz3n9b8','订单退款','2026-04-24 03:27:11'),(556,273,2,137.00,1142.00,'withdraw','withdraw_1777554477945_px5ei1dgw','提现','2026-04-16 22:53:21'),(557,273,2,129.00,688.00,'withdraw','withdraw_1777554477945_wm95f37a9','提现','2026-04-30 13:18:16'),(558,273,4,316.00,1906.00,'bonus','bonus_1777554477945_8a6wou3sb','活动奖励','2026-04-17 01:03:13'),(559,274,1,275.00,1392.00,'recycle','recycle_1777554477945_svyr1rdon','回收订单收入','2026-04-21 05:58:44'),(560,274,2,108.00,1321.00,'withdraw','withdraw_1777554477945_m3fpyb8q6','提现','2026-04-24 01:26:09'),(561,274,1,188.00,1264.00,'recycle','recycle_1777554477945_1nmiqwh0q','回收订单收入','2026-04-20 20:09:48'),(562,274,2,216.00,1751.00,'withdraw','withdraw_1777554477945_oedgq4679','提现','2026-04-25 01:24:26'),(563,275,4,130.00,1720.00,'bonus','bonus_1777554477945_6rdeakfvi','活动奖励','2026-04-25 02:27:59'),(564,275,3,317.00,2164.00,'refund','refund_1777554477945_npvs9pwcd','订单退款','2026-04-24 23:26:57'),(565,275,1,180.00,1609.00,'recycle','recycle_1777554477945_uzx46cana','回收订单收入','2026-04-26 16:49:24'),(566,275,2,346.00,1657.00,'withdraw','withdraw_1777554477945_ezbr6pusc','提现','2026-04-21 01:39:34'),(567,276,2,275.00,628.00,'withdraw','withdraw_1777554477945_go51d2xs0','提现','2026-04-20 09:53:36'),(568,276,1,311.00,430.00,'recycle','recycle_1777554477945_q7dg1g2sj','回收订单收入','2026-04-24 22:06:29'),(569,277,4,317.00,870.00,'bonus','bonus_1777554477945_z1wmfo23x','活动奖励','2026-04-24 03:51:44'),(570,277,4,290.00,1671.00,'bonus','bonus_1777554477945_9erb0shl3','活动奖励','2026-04-28 22:51:29'),(571,277,4,193.00,1314.00,'bonus','bonus_1777554477945_w9s3gd5ki','活动奖励','2026-04-28 23:33:26'),(572,277,4,189.00,1226.00,'bonus','bonus_1777554477945_r0ij6xvzk','活动奖励','2026-04-16 13:42:55'),(573,277,2,167.00,1963.00,'withdraw','withdraw_1777554477945_4xph37osa','提现','2026-04-30 11:30:20'),(574,278,4,162.00,1735.00,'bonus','bonus_1777554477945_dzdizo0fa','活动奖励','2026-04-30 03:49:40'),(575,278,2,85.00,990.00,'withdraw','withdraw_1777554477945_u43isx0qf','提现','2026-04-29 16:09:53'),(576,278,1,222.00,1876.00,'recycle','recycle_1777554477945_4i6sr2bm7','回收订单收入','2026-04-30 20:04:25'),(577,278,2,129.00,1015.00,'withdraw','withdraw_1777554477945_0t5gg6ps2','提现','2026-04-20 03:43:33'),(578,278,3,183.00,830.00,'refund','refund_1777554477945_tqq4asu9f','订单退款','2026-04-30 17:25:54'),(579,279,3,124.00,2027.00,'refund','refund_1777554477945_nyq0jnzro','订单退款','2026-04-24 22:50:12'),(580,279,4,249.00,2005.00,'bonus','bonus_1777554477945_7ivdfudx8','活动奖励','2026-04-17 22:06:36'),(581,279,1,229.00,906.00,'recycle','recycle_1777554477945_7axfbt99x','回收订单收入','2026-04-28 02:56:33'),(582,280,3,286.00,1625.00,'refund','refund_1777554477945_awmrcuewa','订单退款','2026-04-19 11:23:33'),(583,280,3,345.00,955.00,'refund','refund_1777554477945_9i1rcm46o','订单退款','2026-04-19 15:20:11'),(584,280,1,292.00,1972.00,'recycle','recycle_1777554477945_v1fnc8v7t','回收订单收入','2026-04-27 14:02:10'),(585,280,4,222.00,939.00,'bonus','bonus_1777554477945_d4biiqa5y','活动奖励','2026-04-18 22:19:38'),(586,281,3,122.00,611.00,'refund','refund_1777554477945_k2xtnhpa1','订单退款','2026-04-20 04:40:02'),(587,281,3,134.00,1054.00,'refund','refund_1777554477945_hniazo2qq','订单退款','2026-04-19 23:25:31'),(588,281,4,180.00,594.00,'bonus','bonus_1777554477945_yafuck72p','活动奖励','2026-04-26 23:59:26'),(589,281,3,50.00,669.00,'refund','refund_1777554477945_wj0att8j5','订单退款','2026-04-22 12:17:50'),(590,282,2,301.00,2075.00,'withdraw','withdraw_1777554477945_awmeefzxg','提现','2026-04-20 11:34:54'),(591,282,2,309.00,1514.00,'withdraw','withdraw_1777554477945_y8ac7knxg','提现','2026-04-30 14:08:59'),(592,282,4,192.00,892.00,'bonus','bonus_1777554477945_1t2td0jab','活动奖励','2026-04-16 02:04:58'),(593,282,2,105.00,269.00,'withdraw','withdraw_1777554477945_fkocmfogy','提现','2026-04-25 15:12:25'),(594,283,1,145.00,952.00,'recycle','recycle_1777554477945_twbya5klj','回收订单收入','2026-04-29 00:48:10'),(595,283,2,120.00,288.00,'withdraw','withdraw_1777554477945_c53ietwvl','提现','2026-04-23 09:42:26'),(596,283,3,268.00,1365.00,'refund','refund_1777554477945_jnese1zhd','订单退款','2026-04-29 14:51:38'),(597,283,2,325.00,690.00,'withdraw','withdraw_1777554477945_jkxuoy151','提现','2026-04-26 21:50:20'),(598,284,1,246.00,1225.00,'recycle','recycle_1777554477945_1bn1svtiv','回收订单收入','2026-04-29 12:32:17'),(599,284,3,117.00,1950.00,'refund','refund_1777554477945_vtyy4xg4w','订单退款','2026-04-23 20:31:03'),(600,284,2,198.00,856.00,'withdraw','withdraw_1777554477945_15wcgyves','提现','2026-04-16 22:41:25'),(601,285,4,126.00,289.00,'bonus','bonus_1777554477945_s6qfl7gvb','活动奖励','2026-04-27 14:00:20'),(602,285,1,286.00,1737.00,'recycle','recycle_1777554477945_iecvdjldt','回收订单收入','2026-04-26 05:57:49'),(603,285,3,178.00,1807.00,'refund','refund_1777554477945_umubc190v','订单退款','2026-04-20 02:02:16'),(604,285,4,331.00,1637.00,'bonus','bonus_1777554477945_wl86h6z5v','活动奖励','2026-04-30 18:06:30'),(605,285,2,232.00,1519.00,'withdraw','withdraw_1777554477945_wn2ee9t7p','提现','2026-04-16 08:54:07'),(606,285,1,136.00,1278.00,'recycle','recycle_1777554477945_h919wspa9','回收订单收入','2026-04-15 22:33:03'),(607,286,4,234.00,2129.00,'bonus','bonus_1777554477945_u0l1v83qj','活动奖励','2026-04-27 02:50:01'),(608,286,2,150.00,242.00,'withdraw','withdraw_1777554477945_nbbx2joox','提现','2026-04-25 11:18:33'),(609,286,4,232.00,730.00,'bonus','bonus_1777554477945_6cwcp12f1','活动奖励','2026-04-30 05:37:44'),(610,287,3,51.00,1828.00,'refund','refund_1777554477945_sm7bpksf5','订单退款','2026-04-21 07:33:52'),(611,287,2,105.00,714.00,'withdraw','withdraw_1777554477945_nxpsr5n8x','提现','2026-04-27 15:02:20');
/*!40000 ALTER TABLE `wallet_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `balance` decimal(12,2) DEFAULT '0.00',
  `frozen` decimal(12,2) DEFAULT '0.00',
  `total_income` decimal(12,2) DEFAULT '0.00',
  `total_withdraw` decimal(12,2) DEFAULT '0.00',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES (228,268,1734.00,233.00,2733.00,1702.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(229,269,1165.00,0.00,1791.00,1583.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(230,270,1334.00,0.00,4130.00,777.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(231,271,1015.00,0.00,5641.00,966.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(232,272,444.00,0.00,1516.00,2214.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(233,273,660.00,0.00,1833.00,2943.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(234,274,623.00,366.00,2024.00,1161.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(235,275,1149.00,0.00,3480.00,2717.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(236,276,2017.00,0.00,1680.00,1676.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(237,277,1337.00,0.00,3033.00,3202.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(238,278,647.00,0.00,3899.00,3185.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(239,279,1283.00,189.00,3540.00,965.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(240,280,1069.00,0.00,5510.00,1236.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(241,281,500.00,0.00,4452.00,1947.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(242,282,496.00,0.00,3858.00,2842.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(243,283,744.00,0.00,5565.00,2882.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(244,284,798.00,327.00,1637.00,3352.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(245,285,1925.00,0.00,1042.00,2601.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(246,286,1086.00,0.00,1547.00,2777.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(247,287,827.00,0.00,4009.00,2879.00,'2026-04-30 21:07:57','2026-04-30 21:07:57'),(248,288,0.00,0.00,0.00,0.00,'2026-04-30 21:34:20','2026-04-30 21:34:20'),(249,289,0.00,0.00,0.00,0.00,'2026-04-30 22:17:17','2026-04-30 22:17:17'),(250,290,0.00,0.00,0.00,0.00,'2026-05-01 08:41:14','2026-05-01 08:41:14');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'digital_recycling'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01  8:55:19
