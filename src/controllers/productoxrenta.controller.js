import * as productoxrentaModel from '../models/productoxrenta.model.js';

export const add_producto_to_renta = async (req, res) => {
  try {
    const { renta_producto_id, statusMessage } = await productoxrentaModel.add_producto_to_renta(req.body);

    if (statusMessage === 'Producto agregado exitosamente a la renta') return res.status(201).send({ message: statusMessage, renta_producto_id });
    else if (statusMessage === 'Renta no encontrada') return res.status(404).send({ message: 'La renta no existe' });
    else if (statusMessage === 'Producto no encontrado') return res.status(404).send({ message: 'El producto no existe' });
    else if (statusMessage === 'El producto no está disponible para renta') return res.status(400).send({ message: 'El producto no está disponible para renta' });
    else if (statusMessage.startsWith('Cantidad solicitada excede el stock disponible')) return res.status(400).send({ message: statusMessage });
    else if (statusMessage === 'El producto ya está asociado con esta renta') return res.status(409).send({ message: statusMessage });
    else return res.status(500).send({ message: 'Error desconocido al agregar producto a la renta' });
  } catch (error) {
    res.status(500).json({ message: `Error al agregar producto a la renta: ${error.message}` });
  }
};