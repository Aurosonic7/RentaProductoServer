import mysql from '../config/databases/mysql.js';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

export const create_renta = async (renta) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL create_renta(?, ?, ?, ?, ?, ?, @status_message);`
    await connection.query(query, [
      renta.usuario_id,
      renta.fecha_inicio,
      renta.fecha_fin,
      renta.estado,
      renta.total,
      renta.fecha_devolucion,
    ]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error creating rent: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};