// Importación de librerías y módulos necesarios para la configuración de la base de datos MySQL
import mysql from 'mysql2/promise';
import config from '../config.js';
import logger from '../../utils/logger.js';
import CustomError from '../../utils/error.js';
// Creación de la conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: config.db.mysqlHost,
  port: config.db.mysqlPort,
  user: config.db.mysqlUser,
  password: config.db.mysqlPassword,
  database: config.db.mysqlDatabase
});
// Iniciar la conexión a la base de datos MySQL
const initialize = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    logger.info('MySQL initialized');
  } catch (error) {
    logger.error(`Error initializing MySQL: ${error}`);
    throw new CustomError('Failed to initialize MySQL', 'DB_INIT_ERROR');
  }
};
// Cerrar la conexión a la base de datos MySQL
const close = async () => {
  try {
    await pool.end();
    logger.info('MySQL closed');
  } catch(error) {
    logger.error(`Error closing MySQL: ${error}`);
    throw new CustomError('Failed to close MySQL', 'DB_CLOSE_ERROR');
  }
};
// Exportar las funciones para iniciar y cerrar la conexión a la base de datos MySQL
export default { pool, initialize, close };