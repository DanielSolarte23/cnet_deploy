-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: colombianet
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (3,'1','2025-06-14 17:55:35','2025-06-14 17:55:35'),(4,'Equipos de Red','2025-06-17 14:59:26','2025-06-17 14:59:26'),(6,'Infraestructura de redes','2025-06-18 16:04:54','2025-06-18 16:04:54'),(7,'Material Eléctrico','2025-06-18 19:16:46','2025-06-18 19:16:46'),(8,'Herramientas','2025-06-18 19:41:58','2025-06-18 19:41:58');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregaproductos`
--

DROP TABLE IF EXISTS `entregaproductos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregaproductos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `devuelto` int DEFAULT '0',
  `estado` enum('pendiente','devuelto_parcial','devuelto_completo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `EntregaId` int DEFAULT NULL,
  `ProductoId` int DEFAULT NULL,
  `unidadesSeriadas` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EntregaId` (`EntregaId`),
  KEY `ProductoId` (`ProductoId`),
  CONSTRAINT `entregaproductos_ibfk_1` FOREIGN KEY (`EntregaId`) REFERENCES `entregas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `entregaproductos_ibfk_2` FOREIGN KEY (`ProductoId`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregaproductos`
--

LOCK TABLES `entregaproductos` WRITE;
/*!40000 ALTER TABLE `entregaproductos` DISABLE KEYS */;
INSERT INTO `entregaproductos` VALUES (2,1,'Inversor Solar',NULL,'MUST','Blanco',0,'pendiente','2025-06-18 19:46:59','2025-06-18 19:46:59',2,7,'[62]'),(3,1,'Conversor de voltaje',NULL,'N/A','Gris',0,'pendiente','2025-06-18 19:46:59','2025-06-18 19:46:59',2,8,NULL),(4,1,'Bateria  ion de litio',NULL,'HUAWEI','Negro',0,'pendiente','2025-06-18 19:46:59','2025-06-18 19:46:59',2,9,'[63]'),(5,2,'Patch cord ',NULL,'V-KOM','Azul',0,'pendiente','2025-06-18 19:46:59','2025-06-18 19:46:59',2,11,NULL),(6,1,'Taladro',NULL,'PD','Naranja',0,'pendiente','2025-06-18 19:46:59','2025-06-18 19:46:59',2,12,NULL);
/*!40000 ALTER TABLE `entregaproductos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `proyecto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `estado` enum('pendiente','entregada','parcialmente_devuelta','completamente_devuelta') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `fechaEstimadaDevolucion` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `almacenista` int DEFAULT NULL,
  `personalId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `almacenista` (`almacenista`),
  KEY `personalId` (`personalId`),
  CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`almacenista`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`personalId`) REFERENCES `personals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
INSERT INTO `entregas` VALUES (2,'2025-06-18 00:00:00','Nodo de sucre','Se entrega material para instalacion en el nodo de sucre','pendiente','2025-06-21 00:00:00','2025-06-18 19:46:59','2025-06-18 19:46:59',1,8);
/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacions`
--

DROP TABLE IF EXISTS `notificacions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('stock_bajo','devolucion_pendiente','producto_nuevo','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `detalles` json DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fechaGeneracion` datetime DEFAULT NULL,
  `fechaLectura` datetime DEFAULT NULL,
  `nivel` enum('informativa','advertencia','urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'informativa',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productoId` int DEFAULT NULL,
  `usuarioId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productoId` (`productoId`),
  KEY `usuarioId` (`usuarioId`),
  CONSTRAINT `notificacions_ibfk_1` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notificacions_ibfk_2` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacions`
--

LOCK TABLES `notificacions` WRITE;
/*!40000 ALTER TABLE `notificacions` DISABLE KEYS */;
INSERT INTO `notificacions` VALUES (1,'stock_bajo','Stock bajo para el producto: das (0 unidades)','{\"codigo\": \"2321\", \"stockActual\": 0, \"stockMinimo\": 1}',0,'2025-06-14 17:55:58',NULL,'urgente','2025-06-14 17:55:58','2025-06-14 17:55:58',NULL,NULL),(2,'stock_bajo','Stock bajo para el producto: Patch cord 10M (20 unidades)','{\"codigo\": \"PRD-0001\", \"stockActual\": \"20\", \"stockMinimo\": \"5\"}',0,'2025-06-18 16:04:54',NULL,'advertencia','2025-06-18 16:04:54','2025-06-18 16:04:54',5,NULL),(3,'stock_bajo','Stock bajo para el producto: Caja OB  (15 unidades)','{\"codigo\": \"PRD-0002\", \"stockActual\": \"15\", \"stockMinimo\": \"5\"}',0,'2025-06-18 17:04:59',NULL,'advertencia','2025-06-18 17:04:59','2025-06-18 17:04:59',6,NULL),(4,'stock_bajo','Stock bajo para el producto: Inversor Solar (1 unidades)','{\"codigo\": \"PRD-0003\", \"stockActual\": 1, \"stockMinimo\": 1}',0,'2025-06-18 19:16:46',NULL,'advertencia','2025-06-18 19:16:46','2025-06-18 19:16:46',7,NULL),(5,'stock_bajo','Stock bajo para el producto: Bateria  ion de litio (1 unidades)','{\"codigo\": \"PRD-0005\", \"stockActual\": 1, \"stockMinimo\": 1}',0,'2025-06-18 19:22:39',NULL,'advertencia','2025-06-18 19:22:39','2025-06-18 19:22:39',9,NULL),(6,'stock_bajo','Stock bajo para el producto: Patch cord Ethernet (20 unidades)','{\"codigo\": \"PRD-0006\", \"stockActual\": \"20\", \"stockMinimo\": \"5\"}',0,'2025-06-18 19:31:55',NULL,'advertencia','2025-06-18 19:31:55','2025-06-18 19:31:55',10,NULL),(7,'stock_bajo','Stock bajo para el producto: Patch cord  (10 unidades)','{\"codigo\": \"PRD-0007\", \"stockActual\": \"10\", \"stockMinimo\": \"3\"}',0,'2025-06-18 19:33:19',NULL,'advertencia','2025-06-18 19:33:19','2025-06-18 19:33:19',11,NULL),(8,'stock_bajo','Stock bajo para el producto: Taladro (1 unidades)','{\"codigo\": \"PRD-0008\", \"stockActual\": 1, \"stockMinimo\": 1}',0,'2025-06-18 19:41:58',NULL,'advertencia','2025-06-18 19:41:58','2025-06-18 19:41:58',12,NULL),(9,'stock_bajo','Stock bajo para el producto: Inversor Solar (0 unidades)','{\"codigo\": \"PRD-0003\", \"stockActual\": 0, \"stockMinimo\": 1}',0,'2025-06-18 19:46:59',NULL,'urgente','2025-06-18 19:46:59','2025-06-18 19:46:59',7,NULL),(10,'stock_bajo','Stock bajo para el producto: Bateria  ion de litio (0 unidades)','{\"codigo\": \"PRD-0005\", \"stockActual\": 0, \"stockMinimo\": 1}',0,'2025-06-18 19:46:59',NULL,'urgente','2025-06-18 19:46:59','2025-06-18 19:46:59',9,NULL),(11,'stock_bajo','Stock bajo para el producto: Taladro (0 unidades)','{\"codigo\": \"PRD-0008\", \"stockActual\": 0, \"stockMinimo\": 1}',0,'2025-06-18 19:46:59',NULL,'urgente','2025-06-18 19:46:59','2025-06-18 19:46:59',12,NULL),(12,'stock_bajo','Stock bajo para el producto: Fibra 24 Hilos (3599 unidades)','{\"codigo\": \"PRD-0009\", \"stockActual\": \"3599\", \"stockMinimo\": \"99\"}',0,'2025-06-18 20:39:24',NULL,'advertencia','2025-06-18 20:39:24','2025-06-18 20:39:24',13,NULL),(13,'stock_bajo','Stock bajo para el producto: Fibra 24 hilos (4000 unidades)','{\"codigo\": \"PRD-0015\", \"stockActual\": \"4000\", \"stockMinimo\": \"500\"}',0,'2025-06-18 21:08:09',NULL,'advertencia','2025-06-18 21:08:09','2025-06-18 21:08:09',19,NULL),(14,'stock_bajo','Stock bajo para el producto: Fibra 24 hilos (4000 unidades)','{\"codigo\": \"PRD-0016\", \"stockActual\": \"4000\", \"stockMinimo\": \"500\"}',0,'2025-06-18 21:09:47',NULL,'advertencia','2025-06-18 21:09:47','2025-06-18 21:09:47',20,NULL),(15,'stock_bajo','Stock bajo para el producto: Fibra 24 hilos (2538 unidades)','{\"codigo\": \"PRD-0018\", \"stockActual\": \"2538\", \"stockMinimo\": \"500\"}',0,'2025-06-18 21:14:34',NULL,'advertencia','2025-06-18 21:14:34','2025-06-18 21:14:34',22,NULL),(16,'stock_bajo','Stock bajo para el producto: Herrajes de retención (10 unidades)','{\"codigo\": \"PRD-0034\", \"stockActual\": \"10\", \"stockMinimo\": \"10\"}',0,'2025-06-19 20:06:28',NULL,'advertencia','2025-06-19 20:06:28','2025-06-19 20:06:28',38,NULL),(17,'stock_bajo','Stock bajo para el producto: Suspenciones (15 unidades)','{\"codigo\": \"PRD-0037\", \"stockActual\": \"15\", \"stockMinimo\": \"5\"}',0,'2025-06-19 20:58:56',NULL,'advertencia','2025-06-19 20:58:56','2025-06-19 20:58:56',41,NULL),(18,'stock_bajo','Stock bajo para el producto: Suspenciones (15 unidades)','{\"codigo\": \"PRD-0038\", \"stockActual\": \"15\", \"stockMinimo\": \"5\"}',0,'2025-06-19 20:58:56',NULL,'advertencia','2025-06-19 20:58:56','2025-06-19 20:58:56',NULL,NULL),(19,'stock_bajo','Stock bajo para el producto: Marquillas (159 unidades)','{\"codigo\": \"PRD-0038\", \"stockActual\": \"159\", \"stockMinimo\": \"20\"}',0,'2025-06-19 21:10:53',NULL,'advertencia','2025-06-19 21:10:53','2025-06-19 21:10:53',43,NULL),(20,'stock_bajo','Stock bajo para el producto: Marquillas (159 unidades)','{\"codigo\": \"PRD-0039\", \"stockActual\": \"159\", \"stockMinimo\": \"20\"}',0,'2025-06-19 21:10:54',NULL,'advertencia','2025-06-19 21:10:54','2025-06-19 21:10:54',NULL,NULL);
/*!40000 ALTER TABLE `notificacions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personals`
--

DROP TABLE IF EXISTS `personals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cedula` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cargo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departamento` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `apellido` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expedicion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_nacimiento` datetime NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personals`
--

LOCK TABLES `personals` WRITE;
/*!40000 ALTER TABLE `personals` DISABLE KEYS */;
INSERT INTO `personals` VALUES (1,'Daniel Camilo','1002921703','Técnico','Popayán(Cauca)','3147776440','velascoe417@gmail.com',1,'2025-06-14 17:52:25','2025-06-16 19:32:01','Medina Giron','2019-10-22T00:00:00.000Z','2001-10-20 00:00:00','1002921703'),(2,'David Isaías ','1061781464','Empalmador','Popayán(Cauca)','3175380230','Davidsanchezp67@gmail.com',1,'2025-06-16 12:27:34','2025-06-16 12:27:34','Sánchez Pillimue','2016-06-10T00:00:00.000Z','1998-06-07 00:00:00','1061781464'),(3,'Duvan Andres ','1061781685','Coordinador','Popayán(Cauca)','3182061882','Duveishion@gmail.com',1,'2025-06-16 12:30:05','2025-06-16 12:30:05','Urchate Segura','2013-07-09T00:00:00.000Z','1995-07-07 00:00:00','1061781685'),(4,'Elber Isauro','76302726','Técnico','Popayán(Cauca)','318 8372785','elberthpenafiel@yahoo.es',1,'2025-06-16 12:33:14','2025-06-16 12:33:14','Peñafiel Quigüa','2000-06-06T00:00:00.000Z','1981-02-25 00:00:00','76302726'),(5,'Fredy Antonio','1061733566','Coordinador','Popayán(Cauca)','3138646057','famorales66@misena.edu.co',1,'2025-06-16 12:35:32','2025-06-16 12:35:32','Morales Ipia','2008-12-17T00:00:00.000Z','1990-11-27 00:00:00','1061733566'),(6,'Miller Edinson','76328447','Gerente','Popayán(Cauca)','3183734516','directoroperativo@colombianet.tech',1,'2025-06-16 12:38:57','2025-06-16 12:38:57','Cañar Paredes','1996-05-10T00:00:00.000Z','1978-03-06 00:00:00','76328447'),(8,'Romi Esneider','76333492','Coordinador','Popayán(Cauca)','3183438897','romi.piamba@sepcom.com.co',1,'2025-06-16 12:47:08','2025-06-16 12:47:08','Piamba Paredes','1997-11-25T00:00:00.000Z','1979-11-22 00:00:00','76333492'),(9,'Kevin David','1002970548','Empalmador','Popayán(Cauca)','3154098948','zunigazkevin98@gmail.com',1,'2025-06-16 14:20:00','2025-06-16 14:20:00','Zuñiga Zuñiga','2019-01-10T00:00:00.000Z','2000-05-09 00:00:00','1002970548'),(10,'Christian David ','1002972685','Técnico','Popayán(Cauca)','3147776440','velascoe417@gmail.com',1,'2025-06-16 14:22:34','2025-06-16 14:31:13','Velasco','2010-04-26T00:00:00.000Z','1990-07-16 00:00:00','1002972685'),(11,'Miguel Eduardo','1059595050','Técnico','Popayán(Cauca)','3217589300','miguelnu1545@gmail.com',1,'2025-06-18 20:14:54','2025-06-18 20:14:54','Nuñez Castillo','2023-02-23T00:00:00.000Z','2005-02-04 00:00:00','1059595050'),(12,'Astrid Carolina','1002835273','Técnico','Popayán(Cauca)','3223718079','martinezastrid730@gmail.com',1,'2025-06-18 20:17:03','2025-06-18 20:17:03','Martinez Meneses','2019-11-07T00:00:00.000Z','2001-11-05 00:00:00','1002835273'),(13,'Sebastian','1061778536','Técnico','Popayán(Cauca)','3192760591','selofe95@gmail.com',1,'2025-06-18 20:18:50','2025-06-18 20:18:50','Lopez Fernandez','2013-03-20T00:00:00.000Z','1995-03-18 00:00:00','1061778536');
/*!40000 ALTER TABLE `personals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `StantId` int DEFAULT NULL,
  `SubcategoriaId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `StantId` (`StantId`),
  KEY `SubcategoriaId` (`SubcategoriaId`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`StantId`) REFERENCES `stants` (`id`),
  CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`SubcategoriaId`) REFERENCES `subcategorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `marca` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modelo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `unidadMedida` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'unidad',
  `stock` int NOT NULL DEFAULT '0',
  `stockMinimo` int DEFAULT '5',
  `fechaIngreso` datetime DEFAULT NULL,
  `estado` enum('disponible','agotado','baja') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'disponible',
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `StantId` int DEFAULT NULL,
  `SubcategoriumId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `StantId` (`StantId`),
  KEY `SubcategoriumId` (`SubcategoriumId`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`StantId`) REFERENCES `stants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`SubcategoriumId`) REFERENCES `subcategoria` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (4,'PRD-0000','ONT ZYXEL','ZYXEL','PX3321-T1','BLANCO','unidad',54,5,'2025-06-17 14:59:26','disponible','ONT Nuevas ingresan al almacen','2025-06-17 14:59:26','2025-06-18 16:08:33',6,4),(5,'PRD-0001','Patch cord 3M','V-KOM','LC/UPC-SC/UPC','AZUL-AZUL','unidad',20,5,'2025-06-18 16:04:54','disponible','Patch cord nuevos','2025-06-18 16:04:54','2025-06-18 16:10:00',9,6),(6,'PRD-0002','Caja OB ','V-KOM','Pequeña','Blanco','unidad',15,5,'2025-06-18 17:04:59','disponible','','2025-06-18 17:04:59','2025-06-18 17:04:59',9,7),(7,'PRD-0003','Inversor Solar','MUST','PV3300 TLV(1KW~6KW)','Blanco','unidad',0,1,'2025-06-18 19:16:46','disponible','Inversor solar','2025-06-18 19:16:46','2025-06-18 19:46:59',10,8),(8,'PRD-0004','Conversor de voltaje','N/A','N/A','Gris','unidad',2,1,'2025-06-18 19:18:56','disponible','','2025-06-18 19:18:56','2025-06-18 19:46:59',5,8),(9,'PRD-0005','Bateria  ion de litio','HUAWEI','ESM-48100U2','Negro','unidad',0,1,'2025-06-18 19:22:39','disponible','Bateria Iones de litio','2025-06-18 19:22:39','2025-06-18 19:46:59',10,8),(10,'PRD-0006','Patch cord Ethernet','N/A','N/A','Amarillo','unidad',20,5,'2025-06-18 19:31:55','disponible','','2025-06-18 19:31:55','2025-06-18 19:31:55',8,6),(11,'PRD-0007','Patch cord ','V-KOM','LC/UPC - LC/UPC multimodo','Azul','unidad',8,3,'2025-06-18 19:33:19','disponible','','2025-06-18 19:33:19','2025-06-18 19:46:59',9,6),(12,'PRD-0008','Taladro','PD','PD','Naranja','unidad',0,1,'2025-06-18 19:41:58','disponible','','2025-06-18 19:41:58','2025-06-18 19:46:59',42,9),(13,'PRD-0009','Fibra 24 Hilos','N/A','SPAN 200','N/A','metros',3599,99,'2025-06-18 20:39:24','disponible','Carreto de fibra span 200','2025-06-18 20:39:24','2025-06-18 22:03:32',45,10),(14,'PRD-0010','Fibra 24 hilos','N/A','SPAN 200','N/A','metros',4000,100,'2025-06-18 20:42:58','disponible','','2025-06-18 20:42:58','2025-06-18 22:03:35',45,10),(15,'PRD-0011','Fibra 24 hilos','N/A','SPAN 200','N/A','metros',4000,100,'2025-06-18 20:46:05','disponible','','2025-06-18 20:46:05','2025-06-18 22:03:37',45,10),(16,'PRD-0012','Fibra 12 hilos','N/A','SPAN 100','N/A','metros',3000,100,'2025-06-18 20:55:38','disponible','','2025-06-18 20:55:38','2025-06-18 22:03:39',45,10),(17,'PRD-0013','Fibra 12 hilos','N/A','SPAN 100','N/A','metros',3000,100,'2025-06-18 20:56:54','disponible','','2025-06-18 20:56:54','2025-06-18 22:03:41',45,10),(18,'PRD-0014','Fibra 24 hilos','N/A','SPAN 500','N/A','metros',4000,300,'2025-06-18 21:05:12','disponible','','2025-06-18 21:05:12','2025-06-18 22:03:43',45,10),(19,'PRD-0015','Fibra 24 hilos','N/A','ADSS SPAN 200','N/A','metros',4000,500,'2025-06-18 21:08:09','disponible','','2025-06-18 21:08:09','2025-06-18 22:03:48',45,10),(20,'PRD-0016','Fibra 24 hilos','N/A','ADSS SPAN 300','N/A','metros',4000,500,'2025-06-18 21:09:47','disponible','','2025-06-18 21:09:47','2025-06-18 22:03:53',45,10),(21,'PRD-0017','Fibra 24 hilos','N/A','ADSS SPAN 300','N/A','metros',549,500,'2025-06-18 21:13:03','disponible','','2025-06-18 21:13:03','2025-06-18 22:03:57',45,10),(22,'PRD-0018','Fibra 24 hilos','N/A','ADSS SPAN 200','N/A','metros',2538,500,'2025-06-18 21:14:34','disponible','','2025-06-18 21:14:34','2025-06-18 22:04:00',45,10),(23,'PRD-0019','Fibra 24 hilos','N/A','ADSS SPAN 300','N/A','metros',4000,500,'2025-06-18 21:53:10','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:53:10','2025-06-18 22:04:04',45,10),(24,'PRD-0020','Fibra 24 hilos','N/A','ADSS SPAN 400','N/A','metros',4000,500,'2025-06-18 21:55:38','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:55:38','2025-06-18 22:04:08',45,10),(25,'PRD-0021','Fibra 24 hilos','N/A','ADSS SPAN 400','N/A','metros',4000,500,'2025-06-18 21:55:40','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:55:40','2025-06-18 22:04:11',45,10),(26,'PRD-0022','Fibra 24 hilos','N/A','ADSS SPAN 400','N/A','metros',4000,500,'2025-06-18 21:55:43','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:55:43','2025-06-18 22:04:14',45,10),(27,'PRD-0023','Fibra 24 hilos','N/A','ADSS SPAN 500','N/A','metros',4000,500,'2025-06-18 21:56:08','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:56:08','2025-06-18 22:04:16',45,10),(28,'PRD-0024','Fibra 12 hilos','N/A','ASU SPAN 100','N/A','metros',870,500,'2025-06-18 21:57:10','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:57:10','2025-06-18 22:04:18',45,10),(29,'PRD-0025','Fibra 12 hilos','N/A','ASU SPAN 100','N/A','metros',1700,500,'2025-06-18 21:58:17','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:58:17','2025-06-18 22:04:21',45,10),(30,'PRD-0026','Fibra 12 hilos','N/A','ASU SPAN 100','N/A','metros',4000,500,'2025-06-18 21:58:36','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:58:36','2025-06-18 22:04:24',45,10),(31,'PRD-0027','Fibra 12 hilos','N/A','ADSS SPAN 800','N/A','metros',1609,500,'2025-06-18 21:59:45','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 21:59:45','2025-06-18 22:04:27',45,10),(32,'PRD-0028','Fibra 24 hilos','N/A','ADSS SPAN 300','N/A','metros',4000,500,'2025-06-18 22:00:33','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 22:00:33','2025-06-18 22:04:29',45,10),(33,'PRD-0029','Fibra 24 hilos','N/A','ADSS SPAN 400','N/A','metros',4000,500,'2025-06-18 22:00:52','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 22:00:52','2025-06-18 22:04:32',45,10),(34,'PRD-0030','Fibra 24 hilos','N/A','ADSS SPAN 300','N/A','metros',4000,500,'2025-06-18 22:01:04','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 22:01:04','2025-06-18 22:01:04',45,10),(36,'PRD-0032','Fibra 24 hilos','N/A','ADSS SPAN 500','N/A','metros',4000,500,'2025-06-18 22:01:29','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 22:01:29','2025-06-18 22:01:29',45,10),(37,'PRD-0033','Fibra 12 hilos','N/A','ADSS SPAN 100','N/A','metros',4000,500,'2025-06-18 22:02:19','disponible','carreto de fibra recien ingresado a bodega.','2025-06-18 22:02:19','2025-06-18 22:02:19',45,10),(38,'PRD-0034','Herrajes de retención','SIXCOAX','7mm-7.9mm','Azul','unidad',110,10,'2025-06-19 20:06:28','disponible','','2025-06-19 20:06:28','2025-06-19 20:18:52',34,11),(39,'PRD-0035','Trompoplatinas','N/A','N/A','N/A','unidad',172,10,'2025-06-19 20:30:07','disponible','','2025-06-19 20:30:07','2025-06-19 20:30:07',34,11),(40,'PRD-0036','Omada GB SFP','TP-LINK','MC220L(UN)','N/A','unidad',3,2,'2025-06-19 20:36:07','disponible','','2025-06-19 20:36:07','2025-06-19 20:36:07',5,12),(41,'PRD-0037','Suspenciones','N/A','N/A','N/A','unidad',15,5,'2025-06-19 20:58:56','disponible','','2025-06-19 20:58:56','2025-06-19 20:58:56',34,11),(43,'PRD-0038','Marquillas','N/A','N/A','N/A','unidad',458,20,'2025-06-19 21:10:53','disponible','','2025-06-19 21:10:53','2025-06-19 21:40:53',39,13);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productounidads`
--

DROP TABLE IF EXISTS `productounidads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productounidads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('nuevo','usado','baja') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'nuevo',
  `fechaIngreso` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productoId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial` (`serial`),
  KEY `productoId` (`productoId`),
  CONSTRAINT `productounidads_ibfk_1` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productounidads`
--

LOCK TABLES `productounidads` WRITE;
/*!40000 ALTER TABLE `productounidads` DISABLE KEYS */;
INSERT INTO `productounidads` VALUES (8,'S240733013905','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(9,'S240733014168','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(10,'S240733014156','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(11,'S240733014153','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(12,'S240733014163','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(13,'S240733014072','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(14,'S240733014161','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(15,'S240733013897','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(16,'S240733013837','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(17,'S240733014836','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(18,'S240733014121','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(19,'S240733014143','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(20,'S240733014093','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(21,'S240733014139','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(22,'S240733014138','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(23,'S240733014116','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(24,'S240733014132','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(25,'S240733014129','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(26,'S240733014123','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(27,'S240733014127','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(28,'S240733013644','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(29,'S240733013507','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(30,'S240733013647','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(31,'S240733013525','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(32,'S240733013633','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(33,'S240733013707','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(34,'S240733013248','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(35,'S240733013636','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(36,'S240733013524','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(37,'S24073301616','nuevo','2025-06-17 14:59:26','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(38,'ZYXE8CB62A80','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(39,'ZYXE8CB62A73','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(40,'ZYXE8CB62A9F','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(41,'ZYXE8CB62A9B','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(42,'ZYXE8CB62A60','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(43,'ZYXE8CB62AB3','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(44,'ZYXE8CB62779','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(45,'ZYXE8CB62A34','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(46,'ZYXE8CB629F5','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(47,'ZYXE8CB62A9E','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(48,'ZYXE8CB85BA6','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(49,'ZYXE8CB85B8F','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(50,'ZYXE8CB85B86','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(51,'ZYXE8CB85BA1','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(52,'ZYXE8CB85BA8','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(53,'ZYXE8CB85B60','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(54,'ZYXE8CB85BA3','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(55,'ZYXE8CB85BA4','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(56,'ZYXE8CB85A97','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(57,'ZYXE8CB85B61','nuevo','2025-06-17 15:05:58','2025-06-17 15:05:58','2025-06-17 15:05:58',4),(58,'ZYXE8CB72A77','nuevo','2025-06-17 15:22:23','2025-06-17 15:22:23','2025-06-17 15:22:23',4),(59,'ZYXE8CB729EF','nuevo','2025-06-17 15:22:23','2025-06-17 15:22:23','2025-06-17 15:22:23',4),(60,'ZYXE8CB729E8','nuevo','2025-06-17 15:22:23','2025-06-17 15:22:23','2025-06-17 15:22:23',4),(61,'ZYXE8CBT2932','nuevo','2025-06-17 15:22:23','2025-06-17 15:22:23','2025-06-17 15:22:23',4),(62,'PV33T3024ME0U210023','nuevo','2025-06-18 19:16:46','2025-06-18 19:16:46','2025-06-18 19:16:46',7),(63,'ESM-48100U2','nuevo','2025-06-18 19:22:39','2025-06-18 19:22:39','2025-06-18 19:22:39',9),(64,'pd','nuevo','2025-06-18 19:41:58','2025-06-18 19:41:58','2025-06-18 19:41:58',12),(65,'224C661007673','nuevo','2025-06-19 20:36:07','2025-06-19 20:36:07','2025-06-19 20:36:07',40),(66,'224C661007541','nuevo','2025-06-19 20:36:07','2025-06-19 20:36:07','2025-06-19 20:36:07',40),(67,'224C661007649','nuevo','2025-06-19 20:36:07','2025-06-19 20:36:07','2025-06-19 20:36:07',40);
/*!40000 ALTER TABLE `productounidads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reintegroproductos`
--

DROP TABLE IF EXISTS `reintegroproductos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reintegroproductos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidad` int DEFAULT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ProductoId` int DEFAULT NULL,
  `ReintegroId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductoId` (`ProductoId`),
  KEY `ReintegroId` (`ReintegroId`),
  CONSTRAINT `reintegroproductos_ibfk_1` FOREIGN KEY (`ProductoId`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reintegroproductos_ibfk_2` FOREIGN KEY (`ReintegroId`) REFERENCES `reintegros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reintegroproductos`
--

LOCK TABLES `reintegroproductos` WRITE;
/*!40000 ALTER TABLE `reintegroproductos` DISABLE KEYS */;
/*!40000 ALTER TABLE `reintegroproductos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reintegros`
--

DROP TABLE IF EXISTS `reintegros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reintegros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `estado` enum('pendiente','verificado','completado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `personalId` int DEFAULT NULL,
  `almacenistaId` int DEFAULT NULL,
  `entregaId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `personalId` (`personalId`),
  KEY `almacenistaId` (`almacenistaId`),
  KEY `entregaId` (`entregaId`),
  CONSTRAINT `reintegros_ibfk_1` FOREIGN KEY (`personalId`) REFERENCES `personals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reintegros_ibfk_2` FOREIGN KEY (`almacenistaId`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reintegros_ibfk_3` FOREIGN KEY (`entregaId`) REFERENCES `entregas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reintegros`
--

LOCK TABLES `reintegros` WRITE;
/*!40000 ALTER TABLE `reintegros` DISABLE KEYS */;
/*!40000 ALTER TABLE `reintegros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20250423202144-create-stant.js'),('20250423203219-create-categoria.js'),('20250423203255-create-subcategoria.js'),('20250423203327-create-producto.js'),('20250423203348-create-entrega.js'),('20250423203419-create-entrega-producto.js'),('20250423203439-create-reintegro.js'),('20250423203447-create-reintegro-producto.js'),('20250424123935-create-usuario.js'),('20250522144157-unidadesseriadasentrega.js'),('20250522204719-personalAdd.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stants`
--

DROP TABLE IF EXISTS `stants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stants`
--

LOCK TABLES `stants` WRITE;
/*!40000 ALTER TABLE `stants` DISABLE KEYS */;
INSERT INTO `stants` VALUES (1,'modulo 1','2025-04-29 16:13:30','2025-04-29 16:13:30'),(2,'modulo 2','2025-04-29 16:13:57','2025-04-29 16:13:57'),(3,'modulo 3','2025-04-29 16:14:01','2025-04-29 16:14:01'),(4,'modulo 4','2025-04-29 16:14:06','2025-04-29 16:14:06'),(5,'modulo 5','2025-04-29 16:14:09','2025-04-29 16:14:09'),(6,'modulo 6','2025-04-29 16:14:12','2025-04-29 16:14:12'),(7,'modulo 7','2025-04-29 16:14:16','2025-04-29 16:14:16'),(8,'modulo 8','2025-04-29 16:14:19','2025-04-29 16:14:19'),(9,'modulo 9','2025-04-29 16:14:22','2025-04-29 16:14:22'),(10,'modulo 10','2025-04-29 16:14:26','2025-04-29 16:14:26'),(11,'modulo 11','2025-04-29 16:14:29','2025-04-29 16:14:29'),(12,'modulo 12','2025-04-29 16:14:32','2025-04-29 16:14:32'),(13,'modulo 13','2025-04-29 16:14:35','2025-04-29 16:14:35'),(14,'modulo 14','2025-04-29 16:14:38','2025-04-29 16:14:38'),(15,'modulo 15','2025-04-29 16:14:43','2025-04-29 16:14:43'),(16,'modulo 16','2025-04-29 16:14:46','2025-04-29 16:14:46'),(17,'modulo 17','2025-04-29 16:14:49','2025-04-29 16:14:49'),(18,'modulo 18','2025-04-29 16:14:52','2025-04-29 16:14:52'),(19,'modulo 19','2025-04-29 16:14:56','2025-04-29 16:14:56'),(20,'modulo 20','2025-04-29 16:14:59','2025-04-29 16:14:59'),(21,'modulo 21','2025-04-29 16:15:06','2025-04-29 16:15:06'),(22,'modulo 22','2025-04-29 16:15:08','2025-04-29 16:15:08'),(23,'modulo 23','2025-04-29 16:15:11','2025-04-29 16:15:11'),(24,'modulo 24','2025-04-29 16:15:14','2025-04-29 16:15:14'),(25,'modulo 25','2025-04-29 16:15:17','2025-04-29 16:15:17'),(26,'modulo 26','2025-04-29 16:15:20','2025-04-29 16:15:20'),(27,'modulo 27','2025-04-29 16:15:22','2025-04-29 16:15:22'),(28,'modulo 28','2025-04-29 16:15:25','2025-04-29 16:15:25'),(29,'modulo 29','2025-04-29 16:15:29','2025-04-29 16:15:29'),(30,'modulo 30','2025-04-29 16:15:32','2025-04-29 16:15:32'),(31,'modulo 31','2025-04-29 16:15:36','2025-04-29 16:15:36'),(32,'modulo 32','2025-04-29 16:15:39','2025-04-29 16:15:39'),(33,'modulo 33','2025-04-29 16:15:42','2025-04-29 16:15:42'),(34,'modulo 34','2025-04-29 16:15:45','2025-04-29 16:15:45'),(35,'modulo 35','2025-04-29 16:15:47','2025-04-29 16:15:47'),(36,'modulo 36','2025-04-29 16:15:50','2025-04-29 16:15:50'),(37,'modulo 37','2025-04-29 16:15:53','2025-04-29 16:15:53'),(38,'modulo 38','2025-04-29 16:15:55','2025-04-29 16:15:55'),(39,'modulo 39','2025-04-29 16:15:58','2025-04-29 16:15:58'),(40,'modulo 40','2025-04-29 16:16:02','2025-04-29 16:16:02'),(41,'modulo 41','2025-04-29 16:35:04','2025-06-18 19:36:19'),(42,'modulo 42','2025-06-10 16:54:16','2025-06-18 19:36:54'),(43,'modulo 43','2025-06-10 16:54:49','2025-06-18 19:37:00'),(44,'modulo 44','2025-06-18 19:38:51','2025-06-18 19:38:51'),(45,'Exterior','2025-06-18 20:36:41','2025-06-18 20:36:41');
/*!40000 ALTER TABLE `stants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategoria`
--

DROP TABLE IF EXISTS `subcategoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CategoriumId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CategoriumId` (`CategoriumId`),
  CONSTRAINT `subcategoria_ibfk_1` FOREIGN KEY (`CategoriumId`) REFERENCES `categoria` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategoria`
--

LOCK TABLES `subcategoria` WRITE;
/*!40000 ALTER TABLE `subcategoria` DISABLE KEYS */;
INSERT INTO `subcategoria` VALUES (3,'2','2025-06-14 17:55:35','2025-06-14 17:55:35',3),(4,'Equipos GPON / FTTH','2025-06-17 14:59:26','2025-06-17 14:59:26',4),(6,'Patch cord','2025-06-18 16:04:54','2025-06-18 16:04:54',6),(7,'Empalmes','2025-06-18 17:04:59','2025-06-18 17:04:59',6),(8,'Equipos de Energía Solar','2025-06-18 19:16:46','2025-06-18 19:16:46',7),(9,'Eléctricas','2025-06-18 19:41:58','2025-06-18 19:41:58',8),(10,'Fibras','2025-06-18 20:39:24','2025-06-18 20:39:24',6),(11,'Herrajes de Instalación','2025-06-19 20:06:28','2025-06-19 20:06:28',6),(12,'Media Converter','2025-06-19 20:36:07','2025-06-19 20:36:07',4),(13,'Accesorios de instalación','2025-06-19 21:10:53','2025-06-19 21:10:53',6),(14,'Accesorios de instalación','2025-06-19 21:10:53','2025-06-19 21:10:53',6);
/*!40000 ALTER TABLE `subcategoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategorias`
--

DROP TABLE IF EXISTS `subcategorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CategoriaId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CategoriaId` (`CategoriaId`),
  CONSTRAINT `subcategorias_ibfk_1` FOREIGN KEY (`CategoriaId`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategorias`
--

LOCK TABLES `subcategorias` WRITE;
/*!40000 ALTER TABLE `subcategorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `subcategorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cedula` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `rol` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Daniel Solarte','1061813299','3145636042','Dansol23','danielsolarte22@gmail.com','$2a$10$0Ns3DzGxZCounr2sTdedcezIhcXz950d9NiapCa622DFeQq7nHsJW','administrador','2025-04-30 14:59:35','2025-05-21 20:54:04');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-20 14:52:57
