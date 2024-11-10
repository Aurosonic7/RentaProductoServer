import * as productoModel from '../models/producto.model.js';
import { uploadToDropbox, createFileName } from '../middlewares/upload.js';

export const create_producto = async (req, res) => {
  try {
    const { nombre, descripcion, estado, tarifa_renta, usuario_id, categoria_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'La imagen es obligatoria' });

    try {
      const extension = file.mimetype.split('/')[1];
      const imageName = createFileName(nombre, extension);
      const dropboxPath = await uploadToDropbox(file.buffer, imageName);

      const statusMessage = await productoModel.create_producto({
        nombre,
        descripcion,
        estado,
        tarifa_renta,
        fecha_adquisicion: new Date(),
        imagen: dropboxPath,
        usuario_id,
        categoria_id,
      });

      if (statusMessage === 'Product created successfully') {
        return res.status(201).json({ message: 'Producto creado exitosamente' });
      } else {
        return res.status(400).json({ message: statusMessage });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error al subir la imagen a Dropbox: ' + error.message });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al crear el producto: ${error.message}` });
  }
};


export const get_producto_by_id = async (req, res) => {
  try {
    const producto_id = req.params.id;
    const { statusMessage, producto } = await productoModel.getProductoById(producto_id);
    if (statusMessage === 'Product not found') return res.status(404).json({ message: 'Producto no encontrado' });
    return res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener el producto: ${error.message}` });
  }
};

export const get_all_productos = async (req, res) => {
  try {
    const productos = await productoModel.getAllProductos();
    return res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener los productos: ${error.message}` });
  }
};

export const update_producto = async (req, res) => {
  try {
    const producto_id = req.params.id;
    const { nombre, descripcion, estado, tarifa_renta, usuario_id, categoria_id } = req.body;
    const file = req.file;

    const { statusMessage, producto } = await productoModel.getProductoById(producto_id);
    if (statusMessage === 'Product not found') return res.status(404).json({ message: 'Producto no encontrado' });

    // Crear el nombre completo de la imagen nueva con la extensión al final
    const newImageName = file 
      ? createFileName(nombre || producto.nombre, file.mimetype.split('/')[1])
      : null;

    const productoData = {
      producto_id,
      nombre: nombre || null,
      descripcion: descripcion || null,
      estado: estado || null,
      tarifa_renta: tarifa_renta || null,
      fecha_adquisicion: new Date(),
      imagen: file ? null : producto.imagen, // Ruta de imagen existente si no se proporciona una nueva
      usuario_id: usuario_id || null,
      categoria_id: categoria_id || null,
      oldImagePath: producto.imagen,
      newImageBuffer: file ? file.buffer : null,
      newImageName,
    };

    // Llamar al modelo para actualizar el producto
    const updateStatus = await productoModel.update_producto(productoData);

    if (updateStatus === 'Product updated successfully') {
      return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } else {
      return res.status(400).json({ message: updateStatus });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar el producto: ${error.message}` });
  }
};

export const delete_producto = async (req, res) => {
  try {
    const producto_id = req.params.id;

    const { statusMessage, producto } = await productoModel.getProductoById(producto_id);
    if (statusMessage === 'Product not found') return res.status(404).json({ message: 'Producto no encontrado' });
    
    const imagenPath = producto.imagen;

    const deleteStatus = await productoModel.delete_producto(producto_id, imagenPath);

    if (deleteStatus === 'Product deleted successfully') return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    else return res.status(400).json({ message: deleteStatus });
    
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar el producto: ${error.message}` });
  }
};
