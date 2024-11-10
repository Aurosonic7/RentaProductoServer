import mysql from '../config/databases/mysql.js';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

export const create_categoria = async (categoria) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL create_categoria(?, ?, @status_message);`;
    await connection.query(query, [categoria.nombre, categoria.descripcion]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const get_categorias = async () => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const [rows] = await connection.query(`CALL get_categorias();`);
    return rows;
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const update_categoria = async (categoria_id, categoria) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL update_categoria(?, ?, ?, @status_message);`;
    await connection.query(query, [categoria_id, categoria.nombre, categoria.descripcion]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const delete_categoria = async (categoria_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL delete_categoria(?, @status_message);`;
    await connection.query(query, [categoria_id]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};