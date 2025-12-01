-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: bidgo
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bids` (
  `BidId` int NOT NULL AUTO_INCREMENT,
  `Value` decimal(18,2) NOT NULL,
  `DeliveryDeadline` datetime(6) NOT NULL,
  `Status` int NOT NULL,
  `DriverId` int NOT NULL,
  `TransportRequestId` int NOT NULL,
  PRIMARY KEY (`BidId`),
  KEY `IX_Bids_DriverId` (`DriverId`),
  KEY `IX_Bids_TransportRequestId` (`TransportRequestId`),
  CONSTRAINT `FK_Bids_TransportRequests_TransportRequestId` FOREIGN KEY (`TransportRequestId`) REFERENCES `transportrequests` (`TransportRequestId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Bids_Users_DriverId` FOREIGN KEY (`DriverId`) REFERENCES `users` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `ChatId` int NOT NULL AUTO_INCREMENT,
  `Status` int NOT NULL,
  `TransportRequestId` int NOT NULL,
  PRIMARY KEY (`ChatId`),
  UNIQUE KEY `IX_Chats_TransportRequestId` (`TransportRequestId`),
  CONSTRAINT `FK_Chats_TransportRequests_TransportRequestId` FOREIGN KEY (`TransportRequestId`) REFERENCES `transportrequests` (`TransportRequestId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Context` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TimeStamp` datetime(6) NOT NULL,
  `ChatId` int NOT NULL,
  `DriverId` int NOT NULL,
  `CompanyId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Messages_ChatId` (`ChatId`),
  KEY `IX_Messages_CompanyId` (`CompanyId`),
  KEY `IX_Messages_DriverId` (`DriverId`),
  CONSTRAINT `FK_Messages_Chats_ChatId` FOREIGN KEY (`ChatId`) REFERENCES `chats` (`ChatId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Messages_Users_CompanyId` FOREIGN KEY (`CompanyId`) REFERENCES `users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Messages_Users_DriverId` FOREIGN KEY (`DriverId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `NotificationId` int NOT NULL AUTO_INCREMENT,
  `Context` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TimeStamp` datetime(6) NOT NULL,
  `Type` int NOT NULL,
  `UserId` int NOT NULL,
  `IsRead` tinyint(1) NOT NULL,
  `BidId` int DEFAULT NULL,
  `TransportRequestId` int DEFAULT NULL,
  PRIMARY KEY (`NotificationId`),
  KEY `IX_Notifications_BidId` (`BidId`),
  KEY `IX_Notifications_TransportRequestId` (`TransportRequestId`),
  KEY `IX_Notifications_UserId` (`UserId`),
  CONSTRAINT `FK_Notifications_Bids_BidId` FOREIGN KEY (`BidId`) REFERENCES `bids` (`BidId`),
  CONSTRAINT `FK_Notifications_TransportRequests_TransportRequestId` FOREIGN KEY (`TransportRequestId`) REFERENCES `transportrequests` (`TransportRequestId`),
  CONSTRAINT `FK_Notifications_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `PaymentId` int NOT NULL AUTO_INCREMENT,
  `GrossValue` decimal(18,2) NOT NULL,
  `NetValue` decimal(18,2) NOT NULL,
  `Tax` decimal(18,2) NOT NULL,
  `PaymentStatus` int NOT NULL,
  `PaymentMethod` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `CompletedAt` datetime(6) DEFAULT NULL,
  `DeadlineToPay` datetime(6) NOT NULL,
  `FailureReason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CompanyId` int NOT NULL,
  `DriverId` int NOT NULL,
  `TransportRequestId` int NOT NULL,
  `StripePaymentIntentId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `StripePaymentMethodId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`PaymentId`),
  UNIQUE KEY `IX_Payments_TransportRequestId` (`TransportRequestId`),
  KEY `IX_Payments_CompanyId` (`CompanyId`),
  KEY `IX_Payments_DriverId` (`DriverId`),
  CONSTRAINT `FK_Payments_TransportRequests_TransportRequestId` FOREIGN KEY (`TransportRequestId`) REFERENCES `transportrequests` (`TransportRequestId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Payments_Users_CompanyId` FOREIGN KEY (`CompanyId`) REFERENCES `users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Payments_Users_DriverId` FOREIGN KEY (`DriverId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `ReviewId` int NOT NULL AUTO_INCREMENT,
  `TimeStamp` datetime(6) NOT NULL,
  `Classification` decimal(3,2) NOT NULL,
  `DriverId` int NOT NULL,
  `CompanyId` int NOT NULL,
  `TransportRequestId` int NOT NULL,
  `Discriminator` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ServiceQuality` int DEFAULT NULL,
  `ClientSuport` int DEFAULT NULL,
  `Punctuality` int DEFAULT NULL,
  `Behavior` int DEFAULT NULL,
  PRIMARY KEY (`ReviewId`),
  KEY `IX_Reviews_CompanyId` (`CompanyId`),
  KEY `IX_Reviews_DriverId` (`DriverId`),
  KEY `IX_Reviews_TransportRequestId` (`TransportRequestId`),
  CONSTRAINT `FK_Reviews_TransportRequests_TransportRequestId` FOREIGN KEY (`TransportRequestId`) REFERENCES `transportrequests` (`TransportRequestId`) ON DELETE CASCADE,
  CONSTRAINT `FK_Reviews_Users_CompanyId` FOREIGN KEY (`CompanyId`) REFERENCES `users` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Reviews_Users_DriverId` FOREIGN KEY (`DriverId`) REFERENCES `users` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transportrequests`
--

DROP TABLE IF EXISTS `transportrequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transportrequests` (
  `TransportRequestId` int NOT NULL AUTO_INCREMENT,
  `Origin` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Destination` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Package` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Weight` decimal(18,2) NOT NULL,
  `Volume` decimal(18,2) NOT NULL,
  `Length` decimal(18,2) NOT NULL,
  `Width` decimal(18,2) NOT NULL,
  `Height` decimal(18,2) NOT NULL,
  `PickupDate` datetime(6) NOT NULL,
  `DeliveryDate` datetime(6) NOT NULL,
  `Image` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `MaxPrice` decimal(18,2) NOT NULL,
  `Status` int NOT NULL,
  `BiddingStartDate` datetime(6) NOT NULL,
  `BiddingEndDate` datetime(6) NOT NULL,
  `IsAutomaticSelectionEnabled` tinyint(1) NOT NULL,
  `IsAutomaticSelectionExecuted` tinyint(1) NOT NULL,
  `SelectedBidId` int DEFAULT NULL,
  `CompanyId` int NOT NULL,
  PRIMARY KEY (`TransportRequestId`),
  UNIQUE KEY `IX_TransportRequests_SelectedBidId` (`SelectedBidId`),
  KEY `IX_TransportRequests_CompanyId` (`CompanyId`),
  CONSTRAINT `FK_TransportRequests_Bids_SelectedBidId` FOREIGN KEY (`SelectedBidId`) REFERENCES `bids` (`BidId`) ON DELETE RESTRICT,
  CONSTRAINT `FK_TransportRequests_Users_CompanyId` FOREIGN KEY (`CompanyId`) REFERENCES `users` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProfileImage` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PhoneNumber` int NOT NULL,
  `NIF` int NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `UserType` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CompanyName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Address` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DriverLicense` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Insurance` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Users_Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-01 11:40:21
