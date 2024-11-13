import mysql from '../config/databases/mysql.js';
import CustomError from '../utils/error.js';
import logger from '../utils/logger.js';

export const create_usuario = async (usuario) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL create_usuario(?, ?, ?, ?, ?, ?, ?, ?, @status_message);`;
    await connection.query(query, [
      usuario.admin_id,
      usuario.nombre,
      usuario.apellido_pat,
      usuario.apellido_mat,
      usuario.telefono,
      usuario.email,
      usuario.password,
      usuario.avatar,
    ]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const getUsuarioById = async (usuario_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL get_usuario_by_id(?, @status_message);`;
    const [result] = await connection.query(query, [usuario_id]);

    const [statusOutput] = await connection.query('SELECT @status_message AS statusMessage');
    const statusMessage = statusOutput[0].statusMessage;

    if (statusMessage === 'User not found') return { statusMessage };

    return {
      statusMessage,
      usuario: result[0][0],
    };
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const getAllUsuarios = async () => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL get_all_usuarios();`;
    const [usuarios] = await connection.query(query);

    return usuarios[0];
  } catch (error) {
    logger.error(`Error fetching all users: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const update_usuario = async (usuarioData) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL update_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, @status_message);`;
    await connection.query(query, [
      usuarioData.usuario_id,
      usuarioData.admin_id,
      usuarioData.nombre,
      usuarioData.apellido_pat,
      usuarioData.apellido_mat,
      usuarioData.telefono,
      usuarioData.email,
      usuarioData.password,
      usuarioData.avatar,
    ]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    return output[0]?.statusMessage;
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const delete_usuario = async (usuario_id) => {
  let connection;
  try {
    connection = await mysql.pool.getConnection();
    const query = `CALL delete_usuario(?, @status_message);`;
    await connection.query(query, [usuario_id]);

    const [output] = await connection.query('SELECT @status_message AS statusMessage');
    const statusMessage = output[0]?.statusMessage;
    logger.info(`Delete status message: ${statusMessage}`);
    return statusMessage;
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    throw new CustomError('Database Error', 'DB_ERROR', 500, { originalError: error.message });
  } finally {
    if (connection) connection.release();
  }
};