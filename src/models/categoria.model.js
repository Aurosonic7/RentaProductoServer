import mysql from '../config/databases/mysql.js';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

export const create_categoria = async (categoria) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL create_categoria(?, ?, @status_message);`;
    await connection.query(query, [
      categoria.nombre, 
      categoria.descripcion
    ]);
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
    return rows[0];
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
    await connection.query(query, [
      categoria_id,
      categoria.nombre || null,
      categoria.descripcion || null
    ]);
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
    await connection.query(query, [
      categoria_id
    ]);
    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Obtener una categoría por ID
export const get_categoria_by_id = async (categoria_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL get_categoria_by_id(?, @status_message);`;
    const [rows] = await connection.query(query, [
      categoria_id
    ]);
    const [statusOutput] = await connection.query('SELECT @status_message AS statusMessage');
    const statusMessage = statusOutput[0]?.statusMessage;
    if (statusMessage === 'Category found') return { statusMessage, data: rows[0] };
    else return { statusMessage };
  } catch (error) {
    logger.error(`Error fetching category by ID: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};