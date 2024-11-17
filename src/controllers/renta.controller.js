// renta.controller.js
import * as rentaModel from '../models/renta.model.js';

export const create_renta = async (req, res) => {
  try {
    const { renta_id, statusMessage } = await rentaModel.create_renta(req.body);
    
    if (statusMessage === 'Renta creada exitosamente') return res.status(201).send({ message: statusMessage, renta_id });
    else if (statusMessage === 'Usuario no encontrado') return res.status(404).send({ message: 'El usuario no existe' });
    else if (statusMessage === 'La fecha de inicio debe ser anterior a la fecha de fin') return res.status(400).send({ message: statusMessage });
    else if (statusMessage === 'La fecha de devolución debe ser posterior a la fecha de fin') return res.status(400).send({ message: statusMessage });
    else if (statusMessage === 'El total debe ser un valor positivo') return res.status(400).send({ message: statusMessage });
    else if (statusMessage === 'Estado de renta inválido') return res.status(400).send({ message: statusMessage });
    else return res.status(500).send({ message: 'Error desconocido durante la creación de renta' });
  } catch (error) {
    res.status(500).json({ message: `Error durante la creación de renta: ${error.message}` });
  }
};