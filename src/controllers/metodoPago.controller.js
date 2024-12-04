import * as metodopagoModel from '../models/metodoPago.model.js';

export const create_metodoPago = async (req, res) => {
  try {
    const { metodopago_id, statusMessage } = await metodopagoModel.create_metodoPago(req.body);

    switch (statusMessage) {
      case 'Pago procesado exitosamente':
        return res.status(201).json({ message: statusMessage, metodopago_id });
      case 'Método de pago inválido':
      case 'Estado de pago inválido':
      case 'Renta no encontrada':
        return res.status(400).json({ message: statusMessage });
      default:
        return res.status(500).json({ message: 'Error desconocido al procesar el pago', statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al procesar el pago: ${error.message}` });
  }
};

export const get_all_metodosPago = async (req, res) => {
  try {
    const metodosPago = await metodopagoModel.get_all_metodosPago();
    return res.status(200).json({ metodosPago });
  } catch (error) {
    res.status(500).json({ message: `Error al obtener métodos de pago: ${error.message}` });
  }
};

export const get_metodoPago_by_id = async (req, res) => {
  try {
    const { metodopago_id } = req.params;
    const { metodoPago, statusMessage } = await metodopagoModel.get_metodoPago_by_id(metodopago_id);

    switch (statusMessage) {
      case 'Método de pago encontrado':
        return res.status(200).json({ metodoPago });
      case 'Método de pago no encontrado':
        return res.status(404).json({ message: 'Método de pago no encontrado' });
      default:
        return res.status(500).json({ message: 'Error desconocido al obtener el método de pago', statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al obtener el método de pago: ${error.message}` });
  }
};

export const update_metodoPago = async (req, res) => {
  try {
    const { metodopago_id } = req.params;
    const { statusMessage } = await metodopagoModel.update_metodoPago(metodopago_id, req.body);

    switch (statusMessage) {
      case 'Método de pago actualizado exitosamente':
        return res.status(200).json({ message: statusMessage });
      case 'Método de pago no encontrado':
        return res.status(404).json({ message: 'Método de pago no encontrado' });
      case 'Método de pago inválido':
      case 'Estado de pago inválido':
        return res.status(400).json({ message: statusMessage });
      default:
        return res.status(500).json({ message: 'Error desconocido al actualizar el método de pago', statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar el método de pago: ${error.message}` });
  }
};