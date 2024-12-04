import mysql from '../config/databases/mysql.js';
import Joi from 'joi';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

const createMetodoPagoSchema = Joi.object({
  renta_id: Joi.number().integer().positive().required(),
  monto: Joi.number().precision(2).positive().required(),
  fecha_pago: Joi.date().iso().required(),
  metodo: Joi.string().valid('tarjeta', 'efectivo', 'transferencia').required(),
  estado: Joi.string().valid('pendiente', 'completado', 'fallido').required()
});

const updateMetodoPagoSchema = Joi.object({
  monto: Joi.number().precision(2).positive(),
  fecha_pago: Joi.date().iso(),
  metodo: Joi.string().valid('tarjeta', 'efectivo', 'transferencia'),
  estado: Joi.string().valid('pendiente', 'completado', 'fallido')
}).min(1);

const getMetodoPagoByIdSchema = Joi.object({
  metodopago_id: Joi.number().integer().positive().required()
});

export const create_metodoPago = async (data) => {
  let connection;
  try {
    // Validar los datos de entrada
    const { error } = createMetodoPagoSchema.validate(data);
    if (error) {
      logger.error(`Validación de entrada fallida: ${error.details[0].message}`);
      throw new CustomError('Validación de entrada fallida', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    // Llamar al procedimiento almacenado
    const query = `CALL create_metodoPago(?, ?, ?, ?, ?, @p_metodopago_id, @p_status_message);`;
    await connection.query(query, [
      data.renta_id,
      data.monto,
      data.fecha_pago,
      data.metodo,
      data.estado
    ]);

    const [output] = await connection.query('SELECT @p_metodopago_id AS metodopago_id, @p_status_message AS statusMessage;');
    const { metodopago_id, statusMessage } = output[0] || {};

    if (statusMessage === 'Pago procesado exitosamente') {
      logger.info(`Pago procesado: MetodoPagoID=${metodopago_id}, RentaID=${data.renta_id}, Monto=${data.monto}, Metodo=${data.metodo}, Estado=${data.estado}`);
    } else {
      logger.warn(`Intento fallido de procesar pago: RentaID=${data.renta_id}, Monto=${data.monto}, Metodo=${data.metodo}, Estado=${data.estado}, Motivo=${statusMessage}`);
    }

    return { metodopago_id, statusMessage };
  } catch (error) {
    logger.error(`Error creando método de pago: ${error.message}`);
    throw error instanceof CustomError ? error : new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const get_all_metodosPago = async () => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();

    const query = `CALL get_all_metodosPago();`;
    const [results] = await connection.query(query);

    const metodosPago = results[0];

    logger.info(`Obtenidos ${metodosPago.length} métodos de pago`);

    return metodosPago;
  } catch (error) {
    logger.error(`Error obteniendo métodos de pago: ${error.message}`);
    throw new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const get_metodoPago_by_id = async (metodopago_id) => {
  let connection;
  try {
    const { error } = getMetodoPagoByIdSchema.validate({ metodopago_id });
    if (error) {
      logger.error(`Validación de entrada fallida: ${error.details[0].message}`);
      throw new CustomError('Validación de entrada fallida', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    const query = `CALL get_metodoPago_by_id(?, @p_status_message);`;
    await connection.query(query, [metodopago_id]);

    const [output] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const { statusMessage } = output[0] || {};

    if (statusMessage === 'Método de pago encontrado') {
      const [resultSet] = await connection.query(`SELECT 
          m.metodopago_id,
          m.renta_id,
          r.usuario_id,
          u.nombre AS nombre_usuario,
          u.apellido_pat AS apellido_paterno,
          u.apellido_mat AS apellido_materno,
          m.monto,
          m.fecha_pago,
          m.metodo,
          m.estado
        FROM metodoPago m
        JOIN Rentas r ON m.renta_id = r.renta_id
        JOIN Usuarios u ON r.usuario_id = u.usuario_id
        WHERE m.metodopago_id = ?;`, [metodopago_id]);

      const metodoPago = resultSet[0] || null;

      logger.info(`Método de pago encontrado: MetodoPagoID=${metodopago_id}`);

      return { metodoPago, statusMessage };
    } else {
      logger.warn(`Método de pago no encontrado: MetodoPagoID=${metodopago_id}`);
      return { metodoPago: null, statusMessage };
    }
  } catch (error) {
    logger.error(`Error obteniendo método de pago por ID: ${error.message}`);
    throw error instanceof CustomError ? error : new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const update_metodoPago = async (metodopago_id, data) => {
  let connection;
  try {
    const { error } = updateMetodoPagoSchema.validate(data);
    if (error) {
      logger.error(`Validación de entrada fallida: ${error.details[0].message}`);
      throw new CustomError('Validación de entrada fallida', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    const query = `CALL update_metodoPago(?, ?, ?, ?, ?, @p_status_message);`;
    await connection.query(query, [
      metodopago_id,
      data.monto !== undefined ? data.monto : null,
      data.fecha_pago !== undefined ? data.fecha_pago : null,
      data.metodo !== undefined ? data.metodo : null,
      data.estado !== undefined ? data.estado : null
    ]);

    const [output] = await connection.query('SELECT @p_status_message AS statusMessage;');
    const { statusMessage } = output[0] || {};

    if (statusMessage === 'Método de pago actualizado exitosamente') logger.info(`Método de pago actualizado: MetodoPagoID=${metodopago_id}, Datos Actualizados=${JSON.stringify(data)}`);
    else logger.warn(`Intento fallido de actualizar método de pago: MetodoPagoID=${metodopago_id}, Motivo=${statusMessage}`);
    
    return { statusMessage };
  } catch (error) {
    logger.error(`Error actualizando método de pago: ${error.message}`);
    throw error instanceof CustomError ? error : new CustomError('Error en la base de datos', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};