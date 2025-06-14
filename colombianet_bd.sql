-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: colombianet_db
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
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
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
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serial` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `devuelto` int DEFAULT '0',
  `estado` enum('pendiente','devuelto_parcial','devuelto_completo') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregaproductos`
--

LOCK TABLES `entregaproductos` WRITE;
/*!40000 ALTER TABLE `entregaproductos` DISABLE KEYS */;
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
  `proyecto` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `estado` enum('pendiente','entregada','parcialmente_devuelta','completamente_devuelta') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
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
  `tipo` enum('stock_bajo','devolucion_pendiente','producto_nuevo','otro') COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `detalles` json DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fechaGeneracion` datetime DEFAULT NULL,
  `fechaLectura` datetime DEFAULT NULL,
  `nivel` enum('informativa','advertencia','urgente') COLLATE utf8mb4_general_ci DEFAULT 'informativa',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productoId` int DEFAULT NULL,
  `usuarioId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productoId` (`productoId`),
  KEY `usuarioId` (`usuarioId`),
  CONSTRAINT `notificacions_ibfk_1` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notificacions_ibfk_2` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacions`
--

LOCK TABLES `notificacions` WRITE;
/*!40000 ALTER TABLE `notificacions` DISABLE KEYS */;
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
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `cedula` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `cargo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departamento` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `apellido` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expedicion` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_nacimiento` datetime NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personals`
--

LOCK TABLES `personals` WRITE;
/*!40000 ALTER TABLE `personals` DISABLE KEYS */;
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
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serial` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
  `codigo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `marca` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modelo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `unidadMedida` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'unidad',
  `stock` int NOT NULL DEFAULT '0',
  `stockMinimo` int DEFAULT '5',
  `fechaIngreso` datetime DEFAULT NULL,
  `estado` enum('disponible','agotado','baja') COLLATE utf8mb4_general_ci DEFAULT 'disponible',
  `notas` text COLLATE utf8mb4_general_ci,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
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
  `serial` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('nuevo','usado','baja') COLLATE utf8mb4_general_ci DEFAULT 'nuevo',
  `fechaIngreso` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productoId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial` (`serial`),
  KEY `productoId` (`productoId`),
  CONSTRAINT `productounidads_ibfk_1` FOREIGN KEY (`productoId`) REFERENCES `productos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productounidads`
--

LOCK TABLES `productounidads` WRITE;
/*!40000 ALTER TABLE `productounidads` DISABLE KEYS */;
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
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `serial` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
  `observaciones` text COLLATE utf8mb4_general_ci,
  `estado` enum('pendiente','verificado','completado') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
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
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
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
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stants`
--

LOCK TABLES `stants` WRITE;
/*!40000 ALTER TABLE `stants` DISABLE KEYS */;
INSERT INTO `stants` VALUES (1,'modulo 1','2025-04-29 16:13:30','2025-04-29 16:13:30'),(2,'modulo 2','2025-04-29 16:13:57','2025-04-29 16:13:57'),(3,'modulo 3','2025-04-29 16:14:01','2025-04-29 16:14:01'),(4,'modulo 4','2025-04-29 16:14:06','2025-04-29 16:14:06'),(5,'modulo 5','2025-04-29 16:14:09','2025-04-29 16:14:09'),(6,'modulo 6','2025-04-29 16:14:12','2025-04-29 16:14:12'),(7,'modulo 7','2025-04-29 16:14:16','2025-04-29 16:14:16'),(8,'modulo 8','2025-04-29 16:14:19','2025-04-29 16:14:19'),(9,'modulo 9','2025-04-29 16:14:22','2025-04-29 16:14:22'),(10,'modulo 10','2025-04-29 16:14:26','2025-04-29 16:14:26'),(11,'modulo 11','2025-04-29 16:14:29','2025-04-29 16:14:29'),(12,'modulo 12','2025-04-29 16:14:32','2025-04-29 16:14:32'),(13,'modulo 13','2025-04-29 16:14:35','2025-04-29 16:14:35'),(14,'modulo 14','2025-04-29 16:14:38','2025-04-29 16:14:38'),(15,'modulo 15','2025-04-29 16:14:43','2025-04-29 16:14:43'),(16,'modulo 16','2025-04-29 16:14:46','2025-04-29 16:14:46'),(17,'modulo 17','2025-04-29 16:14:49','2025-04-29 16:14:49'),(18,'modulo 18','2025-04-29 16:14:52','2025-04-29 16:14:52'),(19,'modulo 19','2025-04-29 16:14:56','2025-04-29 16:14:56'),(20,'modulo 20','2025-04-29 16:14:59','2025-04-29 16:14:59'),(21,'modulo 21','2025-04-29 16:15:06','2025-04-29 16:15:06'),(22,'modulo 22','2025-04-29 16:15:08','2025-04-29 16:15:08'),(23,'modulo 23','2025-04-29 16:15:11','2025-04-29 16:15:11'),(24,'modulo 24','2025-04-29 16:15:14','2025-04-29 16:15:14'),(25,'modulo 25','2025-04-29 16:15:17','2025-04-29 16:15:17'),(26,'modulo 26','2025-04-29 16:15:20','2025-04-29 16:15:20'),(27,'modulo 27','2025-04-29 16:15:22','2025-04-29 16:15:22'),(28,'modulo 28','2025-04-29 16:15:25','2025-04-29 16:15:25'),(29,'modulo 29','2025-04-29 16:15:29','2025-04-29 16:15:29'),(30,'modulo 30','2025-04-29 16:15:32','2025-04-29 16:15:32'),(31,'modulo 31','2025-04-29 16:15:36','2025-04-29 16:15:36'),(32,'modulo 32','2025-04-29 16:15:39','2025-04-29 16:15:39'),(33,'modulo 33','2025-04-29 16:15:42','2025-04-29 16:15:42'),(34,'modulo 34','2025-04-29 16:15:45','2025-04-29 16:15:45'),(35,'modulo 35','2025-04-29 16:15:47','2025-04-29 16:15:47'),(36,'modulo 36','2025-04-29 16:15:50','2025-04-29 16:15:50'),(37,'modulo 37','2025-04-29 16:15:53','2025-04-29 16:15:53'),(38,'modulo 38','2025-04-29 16:15:55','2025-04-29 16:15:55'),(39,'modulo 39','2025-04-29 16:15:58','2025-04-29 16:15:58'),(40,'modulo 40','2025-04-29 16:16:02','2025-04-29 16:16:02'),(41,'exterior','2025-04-29 16:35:04','2025-04-29 16:35:04'),(42,'modulo 45','2025-06-10 16:54:16','2025-06-10 16:54:16'),(43,'modulo 51','2025-06-10 16:54:49','2025-06-10 16:54:49');
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
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CategoriumId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CategoriumId` (`CategoriumId`),
  CONSTRAINT `subcategoria_ibfk_1` FOREIGN KEY (`CategoriumId`) REFERENCES `categoria` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategoria`
--

LOCK TABLES `subcategoria` WRITE;
/*!40000 ALTER TABLE `subcategoria` DISABLE KEYS */;
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
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
  `nombre` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cedula` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
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

-- Dump completed on 2025-06-13 16:31:16
