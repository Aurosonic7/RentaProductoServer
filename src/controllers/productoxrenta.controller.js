// controllers/productoxrenta.controller.js
import * as productoxrentaModel from '../models/productoxrenta.model.js';

/**
 * Agregar un producto a una renta
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 */
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

/**
 * Remover un producto de una renta
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 */
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