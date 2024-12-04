import * as productoxrentaModel from '../models/productoxrenta.model.js';
import { getDropboxImageLink } from '../middlewares/upload.js';
import logger from '../utils/logger.js';

export const add_producto_to_renta = async (req, res) => {
  try {
    const { renta_producto_id, statusMessage } = await productoxrentaModel.add_producto_to_renta(req.body);

    switch (statusMessage) {
      case 'Producto agregado exitosamente a la renta':
        return res.status(201).json({ message: statusMessage, renta_producto_id });
      case 'Renta no encontrada':
        return res.status(404).json({ message: 'La renta no existe' });
      case 'Producto no encontrado':
        return res.status(404).json({ message: 'El producto no existe' });
      case 'El producto no está disponible para renta':
        return res.status(400).json({ message: 'El producto no está disponible para renta' });
      default:
        if (statusMessage.startsWith('Cantidad solicitada excede el stock disponible')) {
          return res.status(400).json({ message: statusMessage });
        } else if (statusMessage === 'El producto ya está asociado con esta renta') {
          return res.status(409).json({ message: statusMessage });
        } else {
          return res.status(500).json({ message: 'Error desconocido al agregar producto a la renta', statusMessage });
        }
    }
  } catch (error) {
    res.status(500).json({ message: `Error al agregar producto a la renta: ${error.message}` });
  }
};

export const remove_producto_from_renta = async (req, res) => {
  try {
    const { renta_id, producto_id } = req.params;
    const { statusMessage } = await productoxrentaModel.remove_producto_from_renta({ renta_id, producto_id });

    switch (statusMessage) {
      case 'Producto removido exitosamente de la renta':
        return res.status(200).json({ message: statusMessage });
      case 'Producto no asociado con esta renta':
        return res.status(404).json({ message: statusMessage });
      default:
        return res.status(500).json({ message: 'Error desconocido durante la remoción del producto de la renta', statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al remover el producto de la renta: ${error.message}` });
  }
};

export const get_productos_by_usuario = async (req, res) => {
  try {
    const usuario_id = parseInt(req.params.usuario_id, 10);
    if (isNaN(usuario_id) || usuario_id < 1) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const { productos, statusMessage } = await productoxrentaModel.get_productos_by_usuario(usuario_id);

    if (!productos || productos.length === 0) {
      return res.status(404).json({ message: statusMessage || 'No hay productos asociados a este usuario.' });
    }
    
    for (const producto of productos) {
      if (producto.imagen) {
        const imageLink = await getDropboxImageLink(producto.imagen);
        producto.imagen = imageLink || producto.imagen;
      }
    }

    return res.status(200).json({ message: statusMessage, productos });
  } catch (error) {
    logger.error(`Error al obtener productos por usuario: ${error.message}`);
    res.status(500).json({ message: `Error al obtener productos por usuario: ${error.message}` });
  }
};