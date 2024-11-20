// models/productoxrenta.model.js
import mysql from '../config/databases/mysql.js';
import Joi from 'joi';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

/**
 * Esquema de validación para agregar un producto a una renta
 */
const addProductoToRentaSchema = Joi.object({
  renta_id: Joi.number().integer().positive().required(),
  producto_id: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().positive().required()
});

/**
 * Esquema de validación para remover un producto de una renta
 */
const removeProductoFromRentaSchema = Joi.object({
  renta_id: Joi.number().integer().positive().required(),
  producto_id: Joi.number().integer().positive().required()
});

/**
 * Agregar un producto a una renta
 * @param {Object} data - Datos para agregar el producto a la renta
 * @returns {Object} - Objeto con renta_producto_id y statusMessage
 */
export const add_producto_to_renta = async (data) => {
  let connection;
  try {
    // Validar los datos de entrada
    const { error } = addProductoToRentaSchema.validate(data);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    // Llamar al procedimiento almacenado
    const query = `CALL add_producto_to_renta(?, ?, ?, @p_renta_producto_id, @p_status_message);`;
    await connection.query(query, [
      data.renta_id,
      data.producto_id,
      data.cantidad
    ]);

    // Obtener los valores de salida
    const [output] = await connection.query('SELECT @p_renta_producto_id AS renta_producto_id, @p_status_message AS statusMessage;');
    const { renta_producto_id, statusMessage } = output[0] || {};

    // Registrar información o advertencias según el estado
    if (statusMessage === 'Producto agregado exitosamente a la renta') {
      logger.info(`Producto agregado: RentaID=${data.renta_id}, ProductoID=${data.producto_id}, Cantidad=${data.cantidad}`);
    } else {
      logger.warn(`Intento fallido de agregar producto: RentaID=${data.renta_id}, ProductoID=${data.producto_id}, Cantidad=${data.cantidad}, Motivo=${statusMessage}`);
    }

    return { renta_producto_id, statusMessage };
  } catch (error) {
    logger.error(`Error adding producto to renta: ${error.message}`);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Remover un producto de una renta
 * @param {Object} data - Datos para remover el producto de la renta
 * @returns {Object} - Objeto con statusMessage
 */
export const remove_producto_from_renta = async (data) => {
  let connection;
  try {
    // Validar los datos de entrada
    const { error } = removeProductoFromRentaSchema.validate(data);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    // Llamar al procedimiento almacenado
    const query = `CALL remove_producto_from_renta(?, ?, @p_status_message);`;
    await connection.query(query, [
      data.renta_id,
      data.producto_id
    ]);

    // Obtener el valor de salida
    const [output] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const { statusMessage } = output[0] || {};

    // Registrar información o advertencias según el estado
    if (statusMessage === 'Producto removido exitosamente de la renta') {
      logger.info(`Producto removido: RentaID=${data.renta_id}, ProductoID=${data.producto_id}`);
    } else {
      logger.warn(`Intento fallido de remover producto: RentaID=${data.renta_id}, ProductoID=${data.producto_id}, Motivo=${statusMessage}`);
    }

    return { statusMessage };
  } catch (error) {
    logger.error(`Error removiendo producto de la renta: ${error.message}`);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};