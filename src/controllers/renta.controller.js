import * as rentaModel from '../models/renta.model.js';

export const create_renta = async (req, res) => {
  try {
    const { renta_id, statusMessage } = await rentaModel.create_renta(req.body);
    
    if (statusMessage === 'Renta creada exitosamente') {
      return res.status(201).send({ message: statusMessage, renta_id });
    } else if (statusMessage === 'Usuario no encontrado') {
      return res.status(404).send({ message: 'El usuario no existe' });
    } else if (statusMessage === 'La fecha de inicio debe ser anterior a la fecha de fin') {
      return res.status(400).send({ message: statusMessage });
    } else if (statusMessage === 'La fecha de devolución debe ser posterior a la fecha de fin') {
      return res.status(400).send({ message: statusMessage });
    } else if (statusMessage === 'El total debe ser un valor positivo') {
      return res.status(400).send({ message: statusMessage });
    } else if (statusMessage === 'Estado de renta inválido') {
      return res.status(400).send({ message: statusMessage });
    } else {
      return res.status(500).send({ message: 'Error desconocido durante la creación de renta' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error durante la creación de renta: ${error.message}` });
  }
};

export const get_all_rentas = async (req, res) => {
  try {
    const rentas = await rentaModel.get_all_rentas();
    res.status(200).json(rentas);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener rentas: ${error.message}` });
  }
};

export const get_renta_by_id = async (req, res) => {
  try {
    const { statusMessage, data } = await rentaModel.get_renta_by_id(req.params.id);
    if (statusMessage === 'Renta encontrada') {
      return res.status(200).json(data);
    } else if (statusMessage === 'Renta no encontrada') {
      return res.status(404).json({ message: 'Renta no encontrada' });
    } else {
      return res.status(400).json({ message: statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al obtener la renta: ${error.message}` });
  }
};

export const update_renta_status = async (req, res) => {
  try {
    const { nuevo_estado } = req.body;
    const { statusMessage } = await rentaModel.update_renta_status(req.params.id, nuevo_estado);
    
    if (statusMessage === 'Estado de renta actualizado exitosamente') {
      return res.status(200).json({ message: 'Estado de renta actualizado exitosamente' });
    } else if (statusMessage === 'Renta no encontrada') {
      return res.status(404).json({ message: 'Renta no encontrada' });
    } else if (statusMessage === 'Estado de renta inválido') {
      return res.status(400).json({ message: statusMessage });
    } else {
      return res.status(500).json({ message: 'Error desconocido durante la actualización de renta' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar la renta: ${error.message}` });
  }
};

export const delete_renta = async (req, res) => {
  try {
    const { statusMessage } = await rentaModel.delete_renta(req.params.id);
    
    if (statusMessage === 'Renta eliminada exitosamente') {
      return res.status(200).json({ message: 'Renta eliminada exitosamente' });
    } else if (statusMessage === 'Renta no encontrada') {
      return res.status(404).json({ message: 'Renta no encontrada' });
    } else {
      return res.status(400).json({ message: statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar la renta: ${error.message}` });
  }
};

export const finalize_renta = async (req, res) => {
  try {
    const { statusMessage } = await rentaModel.finalize_renta(req.params.id);
    
    if (statusMessage === 'Renta finalizada exitosamente') {
      return res.status(200).json({ message: 'Renta finalizada exitosamente' });
    } else if (statusMessage === 'Renta no encontrada') {
      return res.status(404).json({ message: 'Renta no encontrada' });
    } else if (statusMessage === 'La renta no está en un estado válido para finalizar') {
      return res.status(400).json({ message: statusMessage });
    } else {
      return res.status(500).json({ message: 'Error desconocido durante la finalización de la renta' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al finalizar la renta: ${error.message}` });
  }
};