import { Router } from "express";
import * as productosController from '../controllers/productos.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/').get(verifyToken, productosController.get_productos);
router.route('/').post(verifyToken, productosController.create_producto);
router.route('/:id').get(verifyToken, productosController.get_producto);
router.route('/:id').put(verifyToken, productosController.update_producto);
router.route('/:id').delete(verifyToken, productosController.delete_producto);

export default router;