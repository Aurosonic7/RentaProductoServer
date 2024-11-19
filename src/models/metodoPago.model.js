// metodoPago.controller.js
import * as metodoPagoModel from '../models/metodoPago.model.js';

export const create_metodoPago = async (req, res) => {
  try {
    const { renta_id, monto, fecha_pago, metodo, estado } = req.body;
    const { metodopago_id, statusMessage } = await metodoPagoModel.create_metodoPago({
      renta_id,
      monto,
      fecha_pago,
      metodo,
      estado
    });

    if (statusMessage === 'Pago procesado exitosamente') {
      return res.status(201).json({ message: 'Pago procesado exitosamente', metodopago_id });
    } else if (
      statusMessage === 'Método de pago inválido' ||
      statusMessage === 'Estado de pago inválido' ||
      statusMessage === 'Renta no encontrada'
    ) {
      return res.status(400).json({ message: statusMessage });
    } else {
      return res.status(500).json({ message: 'Error desconocido durante el procesamiento del pago' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error durante el procesamiento del pago: ${error.message}` });
  }
};

export const get_all_metodosPago = async (req, res) => {
  try {
    const metodosPago = await metodoPagoModel.get_all_metodosPago();
    res.status(200).json(metodosPago);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener métodos de pago: ${error.message}` });
  }
};

export const get_metodoPago_by_id = async (req, res) => {
  try {
    const { statusMessage, data } = await metodoPagoModel.get_metodoPago_by_id(req.params.id);
    if (statusMessage === 'Método de pago encontrado') {
      return res.status(200).json(data);
    } else if (statusMessage === 'Método de pago no encontrado') {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    } else {
      return res.status(400).json({ message: statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al obtener el método de pago: ${error.message}` });
  }
};

export const update_metodoPago = async (req, res) => {
  try {
    const { monto, fecha_pago, metodo, estado } = req.body;
    const { statusMessage } = await metodoPagoModel.update_metodoPago(req.params.id, {
      monto,
      fecha_pago,
      metodo,
      estado
    });

    if (statusMessage === 'Método de pago actualizado exitosamente') {
      return res.status(200).json({ message: 'Método de pago actualizado exitosamente' });
    } else if (statusMessage === 'Método de pago no encontrado') {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    } else if (statusMessage === 'Método de pago inválido' || statusMessage === 'Estado de pago inválido') {
      return res.status(400).json({ message: statusMessage });
    } else {
      return res.status(500).json({ message: 'Error desconocido durante la actualización del método de pago' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar el método de pago: ${error.message}` });
  }
};

export const delete_metodoPago = async (req, res) => {
  try {
    const { statusMessage } = await metodoPagoModel.delete_metodoPago(req.params.id);

    if (statusMessage === 'Método de pago eliminado exitosamente') {
      return res.status(200).json({ message: 'Método de pago eliminado exitosamente' });
    } else if (statusMessage === 'Método de pago no encontrado') {
      return res.status(404).json({ message: 'Método de pago no encontrado' });
    } else {
      return res.status(400).json({ message: statusMessage });
    }
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar el método de pago: ${error.message}` });
  }
};