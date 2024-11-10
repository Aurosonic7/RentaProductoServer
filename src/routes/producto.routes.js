<<<<<<< HEAD
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

=======
import { Router } from "express";
import * as productosController from '../controllers/productos.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/').get(verifyToken, productosController.get_productos);
router.route('/').post(verifyToken, productosController.create_producto);
router.route('/:id').get(verifyToken, productosController.get_producto);
router.route('/:id').put(verifyToken, productosController.update_producto);
router.route('/:id').delete(verifyToken, productosController.delete_producto);
>>>>>>> refs/remotes/origin/develop

export default router;