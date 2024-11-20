import mysql from '../config/databases/mysql.js';
import Joi from 'joi';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

const createRentaSchema = Joi.object({
  usuario_id: Joi.number().integer().positive().required(),
  fecha_inicio: Joi.date().iso().required(),
  fecha_fin: Joi.date().iso().greater(Joi.ref('fecha_inicio')).required(),
  estado: Joi.string().valid('pendiente', 'activa', 'finalizada', 'cancelada').required(),
  total: Joi.number().precision(2).positive().required(),
  fecha_devolucion: Joi.date().iso().greater(Joi.ref('fecha_fin')).required()
});

export const create_renta = async (rentaData) => {
  let connection;
  try {
    const { error } = createRentaSchema.validate(rentaData);
    if (error) {
      logger.error(`Validación de entrada fallida: ${error.details[0].message}`);
      throw new CustomError('Validación de entrada fallida', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
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
    logger.error(`Error creando renta: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const get_all_rentas = async () => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const [rows] = await connection.query(`CALL get_all_rentas();`);
    return rows[0];
  } catch (error) {
    logger.error(`Error obteniendo rentas: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const get_renta_by_id = async (renta_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL get_renta_by_id(?, @p_status_message);`;
    const [rows] = await connection.query(query, [renta_id]);

    const [statusOutput] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const statusMessage = statusOutput[0]?.statusMessage;

    if (statusMessage === 'Renta encontrada') {
      return { statusMessage, data: rows[0][0] };
    } else {
      return { statusMessage };
    }
  } catch (error) {
    logger.error(`Error obteniendo renta por ID: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const update_renta_status = async (renta_id, nuevo_estado) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL update_renta_status(?, ?, @p_status_message);`;
    await connection.query(query, [
      renta_id,
      nuevo_estado
    ]);

    const [output] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const { statusMessage } = output[0] || {};

    return { statusMessage };
  } catch (error) {
    logger.error(`Error actualizando estado de renta: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const delete_renta = async (renta_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL delete_renta(?, @p_status_message);`;
    await connection.query(query, [renta_id]);

    const [output] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const { statusMessage } = output[0] || {};

    return { statusMessage };
  } catch (error) {
    logger.error(`Error eliminando renta: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const finalize_renta = async (renta_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL finalize_renta(?, @p_status_message);`;
    await connection.query(query, [renta_id]);

    const [output] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const { statusMessage } = output[0] || {};

    return { statusMessage };
  } catch (error) {
    logger.error(`Error finalizando renta: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};