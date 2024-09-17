import mysql from 'mysql2/promise';
import config from '../config.js';
import logger from '../../utils/logger.js';
import CustomError from '../../utils/error.js';

const pool = mysql.createPool({
  host: config.db.mysqlHost,
  port: config.db.mysqlPort,
  user: config.db.mysqlUser,
  password: config.db.mysqlPassword,
  database: config.db.mysqlDatabase
});

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

const close = async () => {
  try {
    await pool.end();
    logger.info('MySQL closed');
  } catch(error) {
    logger.error(`Error closing MySQL: ${error}`);
    throw new CustomError('Failed to close MySQL', 'DB_CLOSE_ERROR');
  }
};

export default { pool, initialize, close };