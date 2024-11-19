import mysql from '../config/databases/mysql.js';
import Joi from 'joi';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

const addProductoToRentaSchema = Joi.object({
  renta_id: Joi.number().integer().positive().required(),
  producto_id: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().positive().required()
});

export const add_producto_to_renta = async (data) => {
  let connection;
  try {
    const { error } = addProductoToRentaSchema.validate(data);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    const query = `CALL add_producto_to_renta(?, ?, ?, @p_renta_producto_id, @p_status_message);`;
    await connection.query(query, [
      data.renta_id,
      data.producto_id,
      data.cantidad
    ]);

    const [output] = await connection.query('SELECT @p_renta_producto_id AS renta_producto_id, @p_status_message AS statusMessage;');
    const { renta_producto_id, statusMessage } = output[0] || {};

    if (statusMessage === 'Producto agregado exitosamente a la renta') {
      logger.info(`Producto agregado: RentaID=${data.renta_id}, ProductoID=${data.producto_id}, Cantidad=${data.cantidad}`);
    } else {
      logger.warn(`Intento fallido de agregar producto: RentaID=${data.renta_id}, ProductoID=${data.producto_id}, Cantidad=${data.cantidad}, Motivo=${statusMessage}`);
    }

    return { renta_producto_id, statusMessage };
  } catch (error) {
    logger.error(`Error adding producto to renta: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};