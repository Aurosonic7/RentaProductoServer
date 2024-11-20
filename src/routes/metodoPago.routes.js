import { Router } from 'express';
import * as metodoPagoController from '../controllers/metodoPago.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/')
  .post(verifyToken, metodoPagoController.create_metodoPago)
  .get(verifyToken, metodoPagoController.get_all_metodosPago);

router.route('/:metodopago_id')
  .get(verifyToken, metodoPagoController.get_metodoPago_by_id)
  .put(verifyToken, metodoPagoController.update_metodoPago);

export default router;