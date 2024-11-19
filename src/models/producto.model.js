// producto.model.js
import mysql from '../config/databases/mysql.js';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

export const create_producto = async (producto) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL create_producto(?, ?, ?, ?, ?, ?, ?, ?, ?, @status_message);`;
    await connection.query(query, [
      producto.nombre,
      producto.descripcion,
      producto.estado,
      producto.tarifa_renta,
      producto.fecha_adquisicion,
      producto.imagen,
      producto.stock, 
      producto.usuario_id,
      producto.categoria_id,
    ]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const getProductoById = async (producto_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL get_producto_by_id(?, @status_message);`;
    const [result] = await connection.query(query, [producto_id]);

    const [statusOutput] = await connection.query('SELECT @status_message AS statusMessage');
    const statusMessage = statusOutput[0].statusMessage;

    if (statusMessage === 'Producto no encontrado') return { statusMessage };

    return { statusMessage, producto: result[0][0] };
  } catch (error) {
    logger.error(`Error fetching product by ID: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const getAllProductos = async () => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL get_all_productos();`;
    const [productos] = await connection.query(query);

    return productos[0]; 
  } catch (error) {
    logger.error(`Error fetching all products: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const delete_producto = async (producto_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL delete_producto(?, @status_message);`;
    await connection.query(query, [producto_id]);
    
    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    const statusMessage = output[0]?.statusMessage;
    logger.info(`Delete status message: ${statusMessage}`);
    return statusMessage;
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const update_producto = async (productoData) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL update_producto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @status_message);`;
    const params = [
      productoData.producto_id,
      productoData.nombre,
      productoData.descripcion,
      productoData.estado,
      productoData.tarifa_renta,
      productoData.fecha_adquisicion,
      productoData.imagen,
      productoData.stock,         
      productoData.usuario_id,
      productoData.categoria_id,
    ];

    await connection.query(query, params);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0].statusMessage;
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};