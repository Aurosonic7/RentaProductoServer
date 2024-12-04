// producto.controller.js
import * as productoModel from '../models/producto.model.js';
import { dbx, uploadToDropbox, createFileName, getDropboxImageLink } from '../middlewares/upload.js';
import logger from '../utils/logger.js';

export const create_producto = async (req, res) => {
  try {
    const { nombre = 'default_name', descripcion, estado, tarifa_renta, stock, usuario_id, categoria_id } = req.body;

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'La imagen es obligatoria' });

    const extension = file.mimetype.split('/')[1];
    const imageName = createFileName(nombre, extension);
    
    const dropboxPath = await uploadToDropbox(file.buffer, imageName);

    const statusMessage = await productoModel.create_producto({ nombre, descripcion, estado, tarifa_renta, fecha_adquisicion: new Date(), imagen: dropboxPath, stock, usuario_id, categoria_id, });

    if (statusMessage === 'Producto creado exitosamente') return res.status(201).json({ message: 'Producto creado exitosamente' });
    else return res.status(400).json({ message: statusMessage });
    
  } catch (error) {
    logger.error(`Error al crear el producto: ${error.message}`);
    return res.status(500).json({ message: `Error al crear el producto: ${error.message}` });
  }
};

export const get_all_productos = async (req, res) => {
  try {
    const productos = await productoModel.getAllProductos();
    for (const producto of productos) {
      if (producto.imagen) {
        const imageLink = await getDropboxImageLink(producto.imagen);
        producto.imagen = imageLink || producto.imagen;
      }
    }
    return res.status(200).json({ productos }); 
  } catch (error) {
    logger.error(`Error al obtener los productos: ${error.message}`);
    res.status(500).json({ message: `Error al obtener los productos: ${error.message}` });
  }
};

export const get_producto_by_id = async (req, res) => {
  try {
    const producto_id = parseInt(req.params.id, 10);
    if (isNaN(producto_id) || producto_id < 1) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const { statusMessage, producto } = await productoModel.getProductoById(producto_id);
    if (statusMessage === 'Producto no encontrado') return res.status(404).json({ message: 'Producto no encontrado' });

    if (producto.imagen) {
      const imageLink = await getDropboxImageLink(producto.imagen);
      producto.imagen = imageLink || producto.imagen;
    }

    return res.status(200).json({ producto });
  } catch (error) {
    logger.error(`Error al obtener el producto: ${error.message}`);
    res.status(500).json({ message: `Error al obtener el producto: ${error.message}` });
  }
};

export const update_producto = async (req, res) => {
  try {
    const producto_id = parseInt(req.params.id, 10);
    if (isNaN(producto_id) || producto_id < 1) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const { nombre, descripcion, estado, tarifa_renta, stock, usuario_id, categoria_id } = req.body;

    const file = req.file;

    const { statusMessage: fetchStatus, producto } = await productoModel.getProductoById(producto_id);
    if (fetchStatus === 'Producto no encontrado') return res.status(404).json({ message: 'Producto no encontrado' });

    let newImagePath = producto.imagen;
    if (file) {
      const newImageName = createFileName(nombre || producto.nombre, file.mimetype.split('/')[1]);
      newImagePath = await uploadToDropbox(file.buffer, newImageName);

      if (producto.imagen) {
        try {
          await dbx.filesDeleteV2({ path: producto.imagen });
        } catch (error) {
          logger.warn(`No se pudo eliminar la imagen anterior de Dropbox: ${error.message}`);
        }
      }
    }

    const productoData = {
      producto_id,
      nombre: nombre || null,
      descripcion: descripcion || null,
      estado: estado || null,
      tarifa_renta: tarifa_renta || null,
      fecha_adquisicion: null, 
      imagen: newImagePath || null,
      stock: stock !== undefined ? stock : null, 
      usuario_id: usuario_id || null,
      categoria_id: categoria_id || null,
    };

    const updateStatus = await productoModel.update_producto(productoData);

    if (updateStatus === 'Producto actualizado exitosamente') return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    else if (updateStatus === 'Estado del producto inválido' || updateStatus === 'El stock no puede ser negativo') return res.status(400).json({ message: updateStatus });
    else return res.status(500).json({ message: 'Error desconocido al actualizar el producto' });
  } catch (error) {
    logger.error(`Error al actualizar el producto: ${error.message}`);
    res.status(500).json({ message: `Error al actualizar el producto: ${error.message}` });
  }
};

export const delete_producto = async (req, res) => {
  try {
    const producto_id = parseInt(req.params.id, 10);
    if (isNaN(producto_id) || producto_id < 1) return res.status(400).json({ message: 'ID de producto inválido' });

    const { statusMessage: fetchStatus, producto } = await productoModel.getProductoById(producto_id);
    if (fetchStatus === 'Producto no encontrado') return res.status(404).json({ message: 'Producto no encontrado' });

    if (producto.imagen) {
      try {
        await dbx.filesDeleteV2({ path: producto.imagen });
      } catch (error) {
        logger.warn(`No se pudo eliminar la imagen de Dropbox: ${error.message}`);
      }
    }

    const deleteStatus = await productoModel.delete_producto(producto_id);

    if (deleteStatus === 'Producto eliminado exitosamente') return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    else return res.status(400).json({ message: deleteStatus });
    
  } catch (error) {
    logger.error(`Error al eliminar el producto: ${error.message}`);
    res.status(500).json({ message: `Error al eliminar el producto: ${error.message}` });
  }
};