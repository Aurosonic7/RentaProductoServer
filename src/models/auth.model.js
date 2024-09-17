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
  avatar: Joi.string().optional().allow(null)
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
    const avatar = user.avatar || null;

    connection = await mysql.pool.getConnection();

    const query = `CALL register_user(?, ?, ?, ?, ?, ?, ?, @status_message);`;
    await connection.query(query, [
      user.nombre,
      user.apellido_pat,
      user.apellido_mat,
      user.telefono,
      user.email,
      user.password,
      avatar
    ]);
    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    const statusMessage = output[0]?.statusMessage;
    if (statusMessage === 'User created successfully') {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
      return { statusMessage, token };
    }
    return { statusMessage };
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
    connection = await mysql.pool.getConnection();

    const query = `CALL login_user(?, @hashed_password, @status_message);`;
    await connection.query(query, [user.email]);
    const [output] = await connection.query('SELECT @hashed_password AS hashedPassword, @status_message AS statusMessage');
    const hashedPassword = output[0]?.hashedPassword;
    const statusMessage = output[0]?.statusMessage;
    if (statusMessage === 'Email does not exist') return { statusMessage: 'Email does not exist' };
    const isPasswordValid = await bcrypt.compare(user.password, hashedPassword);

    if (!isPasswordValid) return { statusMessage: 'Incorrect password' };

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    return { statusMessage: 'Login successful', token };

  } catch (error) {
    logger.error(`Error during login: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};