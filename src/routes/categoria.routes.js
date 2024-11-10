import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/')
  .get(verifyToken, categoriaController.get_categorias)
  .post(verifyToken, categoriaController.create_categoria);

router.route('/:id')
  .get(verifyToken, categoriaController.get_categoria_by_id)
  .put(verifyToken, categoriaController.update_categoria)
  .delete(verifyToken, categoriaController.delete_categoria);

export default router;