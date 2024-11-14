import * as rentaModel from '../models/renta.model.js';
import logger from '../utils/logger.js';

export const create_renta = async (req, res) => {
  try {
    const {usuario_id, fecha_inicio, fecha_fin, estado, total, fecha_devolucion} = req.body;

    const statusMessage = await rentaModel.create_renta({
      usuario_id: usuario_id,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
      estado: estado,
      total: total,
      fecha_devolucion: fecha_devolucion
    });

    if(statusMessage === 'Renta created successfully') return res.status(201).json({ message: 'Renta creada exitosamente' });
    else if(statusMessage === 'User not found') return res.status(404).json({ message: 'Usuario no encontrado'});
    else return res.status(500).json({ message: 'Error al crear una renta' });
  } catch (error) {
    logger.error(`Error al crear la renta: ${error.message}`);
    return res.status(500).json({ message: `Error al crear la renta: ${error.message}` });
  }
};