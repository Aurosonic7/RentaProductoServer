import * as usuarioModel from '../models/usuario.model.js';
import { dbx, uploadToDropbox, createFileName, getDropboxImageLink } from '../middlewares/upload.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

export const create_usuario = async (req, res) => {
  try {
    const { admin_id, nombre, apellido_pat, apellido_mat, telefono, email, password, } = req.body;
    
    const file = req.file;
    if (!nombre || !apellido_pat || !email || !password) return res.status(400).json({ message: 'Nombre, apellido paterno, email y contraseña son obligatorios' });
    

    let avatarPath = null;
    if (file) {
      const extension = file.mimetype.split('/')[1];
      const imageName = createFileName(`${nombre}_${apellido_pat}`, extension);
      avatarPath = await uploadToDropbox(file.buffer, imageName);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const statusMessage = await usuarioModel.create_usuario({
      admin_id: admin_id || null,
      nombre,
      apellido_pat,
      apellido_mat: apellido_mat || null,
      telefono: telefono || null,
      email,
      password: hashedPassword,
      avatar: avatarPath,
    });

    if (statusMessage === 'User created successfully') return res.status(201).json({ message: 'Usuario creado exitosamente' });
    else return res.status(400).json({ message: statusMessage });
  } catch (error) {
    logger.error(`Error al crear el usuario: ${error.message}`);
    return res.status(500).json({ message: `Error al crear el usuario: ${error.message}` });
  }
};

export const get_all_usuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.getAllUsuarios();
    for (const usuario of usuarios) {
      if (usuario.avatar) {
        const avatarLink = await getDropboxImageLink(usuario.avatar);
        usuario.avatar = avatarLink || usuario.avatar;
      }
      delete usuario.password;
    }
    return res.status(200).json(usuarios);
  } catch (error) {
    logger.error(`Error al obtener los usuarios: ${error.message}`);
    res.status(500).json({ message: `Error al obtener los usuarios: ${error.message}` });
  }
};

export const get_usuario_by_id = async (req, res) => {
  try {
    const usuario_id = req.params.id;
    const { statusMessage, usuario } = await usuarioModel.getUsuarioById(usuario_id);
    if (statusMessage === 'User not found') return res.status(404).json({ message: 'Usuario no encontrado' });

    if (usuario.avatar) {
      usuario.avatar = await getDropboxImageLink(usuario.avatar) || usuario.avatar;
    }

    delete usuario.password;

    return res.status(200).json(usuario);
  } catch (error) {
    logger.error(`Error al obtener el usuario: ${error.message}`);
    res.status(500).json({ message: `Error al obtener el usuario: ${error.message}` });
  }
};

export const update_usuario = async (req, res) => {
  try {
    const usuario_id = req.params.id;
    const {
      admin_id,
      nombre,
      apellido_pat,
      apellido_mat,
      telefono,
      email,
      password,
    } = req.body;
    const file = req.file;

    const { statusMessage, usuario } = await usuarioModel.getUsuarioById(usuario_id);
    if (statusMessage === 'User not found')
      return res.status(404).json({ message: 'Usuario no encontrado' });

    let avatarPath = usuario.avatar;
    if (file) {
      const extension = file.mimetype.split('/')[1];
      const imageName = createFileName(
        `${nombre || usuario.nombre}_${apellido_pat || usuario.apellido_pat}`,
        extension
      );

      avatarPath = await uploadToDropbox(file.buffer, imageName);

      if (!avatarPath.startsWith('/')) avatarPath = '/' + avatarPath;
      
      if (usuario.avatar) {
        let avatarToDelete = usuario.avatar;
        if (!avatarToDelete.startsWith('/')) avatarToDelete = '/' + avatarToDelete;

        logger.info(`Intentando eliminar el avatar anterior: ${avatarToDelete}`);
        try {
          await dbx.filesDeleteV2({ path: avatarToDelete });
        } catch (error) {
          logger.warn(`No se pudo eliminar el avatar anterior de Dropbox: ${error.error_summary}`);
        }
      }
    }

    let hashedPassword = usuario.password;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const usuarioData = {
      usuario_id,
      admin_id: admin_id || null,
      nombre: nombre || null,
      apellido_pat: apellido_pat || null,
      apellido_mat: apellido_mat || null,
      telefono: telefono || null,
      email: email || null,
      password: hashedPassword || null,
      avatar: avatarPath,
    };

    const updateStatus = await usuarioModel.update_usuario(usuarioData);

    if (updateStatus === 'User updated successfully') return res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    else return res.status(400).json({ message: updateStatus });
    
  } catch (error) {
    logger.error(`Error al actualizar el usuario: ${error.message}`);
    res.status(500).json({ message: `Error al actualizar el usuario: ${error.message}` });
  }
};

export const delete_usuario = async (req, res) => {
  try {
    const usuario_id = req.params.id;

    const { statusMessage, usuario } = await usuarioModel.getUsuarioById(usuario_id);
    if (statusMessage === 'User not found') return res.status(404).json({ message: 'Usuario no encontrado' });

    if (usuario.avatar) {
      try {
        await dbx.filesDeleteV2({ path: usuario.avatar });
      } catch (error) {
        logger.warn(`No se pudo eliminar el avatar de Dropbox: ${error.message}`);
      }
    }

    const deleteStatus = await usuarioModel.delete_usuario(usuario_id);

    if (deleteStatus === 'User deleted successfully') return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    else return res.status(400).json({ message: deleteStatus });
    
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar el usuario: ${error.message}` });
  }
};