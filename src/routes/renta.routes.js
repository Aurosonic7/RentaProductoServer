import { Router } from 'express';
import * as rentaController from '../controllers/renta.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/')
  .post(verifyToken, rentaController.create_renta)
  .get(verifyToken, rentaController.get_all_rentas);

router.route('/:id')
  .get(verifyToken, rentaController.get_renta_by_id)
  .put(verifyToken, rentaController.update_renta_status)
  .delete(verifyToken, rentaController.delete_renta);

router.route('/:id/finalizar')
  .post(verifyToken, rentaController.finalize_renta);

export default router;
