-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               5.7.24 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table payroll.employee
CREATE TABLE IF NOT EXISTS `employee` (
  `Employee_ID` int(11) DEFAULT NULL,
  `employeenumber` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastname` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `middleinitial` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ssn` decimal(10,0) DEFAULT NULL,
  `payrate` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `idpayrates` int(11) DEFAULT '1',
  `vacationdays` int(11) DEFAULT '15',
  `paidtoday` decimal(2,0) DEFAULT NULL,
  `paidlastyear` decimal(2,0) DEFAULT NULL,
  PRIMARY KEY (`employeenumber`),
  UNIQUE KEY `employeenumber` (`employeenumber`),
  KEY `FK_employee_payrate` (`idpayrates`),
  CONSTRAINT `FK_employee_payrate` FOREIGN KEY (`idpayrates`) REFERENCES `payrates` (`idpayrates`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table payroll.payrates
CREATE TABLE IF NOT EXISTS `payrates` (
  `idpayrates` int(11) NOT NULL,
  `payratename` varchar(40) COLLATE utf8_unicode_ci DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `taxpercentage` decimal(10,0) DEFAULT NULL,
  `paytype` int(11) DEFAULT NULL,
  `payamount` decimal(10,0) DEFAULT NULL,
  `ptlevelc` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`idpayrates`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
