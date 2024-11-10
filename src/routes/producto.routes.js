import { Router } from 'express';
import * as productoController from '../controllers/producto.controller.js';
import verifyToken from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.route('/')
  .get(verifyToken, productoController.get_all_productos)
  .post(verifyToken, upload.single('imagen'), productoController.create_producto);

router.route('/:id')
  .get(verifyToken, productoController.get_producto_by_id)
  .delete(verifyToken, productoController.delete_producto)
  .put(verifyToken, upload.single('imagen'), productoController.update_producto);


export default router;