import { Router } from 'express';
import * as productoxrentaController from '../controllers/productoxrenta.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/')
  .post(verifyToken, productoxrentaController.add_producto_to_renta);

router.route(':renta_id/:producto_id')
  .delete(verifyToken, productoxrentaController.remove_producto_from_renta);

export default router;