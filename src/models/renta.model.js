// renta.model.js
import mysql from '../config/databases/mysql.js';
import Joi from 'joi';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

const createRentaSchema = Joi.object({
  usuario_id: Joi.number().integer().positive().required(),
  fecha_inicio: Joi.date().iso().required(),
  fecha_fin: Joi.date().iso().required(),
  estado: Joi.string().valid('pendiente', 'activa', 'finalizada', 'cancelada').required(),
  total: Joi.number().precision(2).positive().required(),
  fecha_devolucion: Joi.date().iso().required()
});

export const create_renta = async (rentaData) => {
  let connection;
  try {
    const { error } = createRentaSchema.validate(rentaData);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    const query = `CALL create_renta(?, ?, ?, ?, ?, ?, @p_renta_id, @p_status_message);`;
    await connection.query(query, [
      rentaData.usuario_id,
      rentaData.fecha_inicio,
      rentaData.fecha_fin,
      rentaData.estado,
      rentaData.total,
      rentaData.fecha_devolucion
    ]);

    const [output] = await connection.query('SELECT @p_renta_id AS renta_id, @p_status_message AS statusMessage;');
    const { renta_id, statusMessage } = output[0] || {};

    return { renta_id, statusMessage };
  } catch (error) {
    logger.error(`Error creating renta: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};