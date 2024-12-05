import mysql from '../config/databases/mysql.js';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

const registerClientSchema = Joi.object({
  nombre: Joi.string().required(),
  apellido_pat: Joi.string().required(),
  apellido_mat: Joi.string().optional(),
  telefono: Joi.string().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  avatar: Joi.string().required(),
});

const loginClientSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const loginClientSchemaName = Joi.object({
  nombre: Joi.string().required()
});


const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const register_user = async (user) => {
  let connection;
  try {
    const { error } = registerClientSchema.validate(user);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    user.password = await hashPassword(user.password);

    connection = await mysql.pool.getConnection();

    const query = `CALL register_user(?, ?, ?, ?, ?, ?, @p_usuario_id, @p_status_message);`;
    await connection.query(query, [
      user.nombre,
      user.apellido_pat,
      user.apellido_mat || null,
      user.email,
      user.password,
      user.avatar,
    ]);

    const [output] = await connection.query('SELECT @p_usuario_id AS usuario_id, @p_status_message AS statusMessage;');
    const { usuario_id, statusMessage } = output[0] || {};

    return { usuario_id, statusMessage };
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const login_user = async (user) => {
  let connection;
  try {
    const { error } = loginClientSchema.validate(user);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    const query = `CALL login_user(?, @p_usuario_id, @p_hashed_password, @p_status_message);`;
    await connection.query(query, [user.email]);

    const [output] = await connection.query('SELECT @p_usuario_id AS usuario_id, @p_hashed_password AS hashedPassword, @p_status_message AS statusMessage;');
    const { usuario_id, hashedPassword, statusMessage } = output[0] || {};

    if (statusMessage === 'El correo electrónico no existe') return { statusMessage: 'Email does not exist' };

    const isPasswordValid = await bcrypt.compare(user.password, hashedPassword);
    if (!isPasswordValid) return { statusMessage: 'Incorrect password' };

    const token = jwt.sign({ email: user.email, usuario_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    return { statusMessage: 'Login successful', token, usuario_id };
  } catch (error) {
    logger.error(`Error during login: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const login_user_name = async (user) => {
  let connection;
  try {
    const { error } = loginClientSchemaName.validate(user);
    if (error) {
      logger.error(`Input validation failed: ${error.details[0].message}`);
      throw new CustomError('Input validation failed', 'VALIDATION_ERROR', 400, { validationError: error.details[0].message });
    }

    connection = await mysql.pool.getConnection();

    const query_by_name = `CALL login_user_by_name(?, @p_usuario_id, @p_returned_name, @p_status_message);`;
      await connection.query(query_by_name, [user.nombre]);

      const [output] = await connection.query(
        'SELECT @p_usuario_id AS usuario_id, @p_returned_name AS returnedName, @p_status_message AS statusMessage;'
      );
      const { usuario_id, returnedName, statusMessage } = output[0] || {};

      if (statusMessage === 'El nombre de usuario no existe') return { statusMessage: 'Username does not exist' };
   
      const token = jwt.sign({ nombre: user.nombre, usuario_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      return { statusMessage: 'Login successful', token, usuario_id, returnedName };

  } catch (error) {
    logger.error(`Error during loginByName: ${error.message}`);
    throw new CustomError('Database Error by Name', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};
