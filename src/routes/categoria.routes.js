import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

// Aplicar verifyToken a todas las rutas de categorías
router.route('/')
  .get(verifyToken, categoriaController.get_categorias)
  .post(verifyToken, categoriaController.create_categoria);

router.route('/:id')
  .put(verifyToken, categoriaController.update_categoria)
  .delete(verifyToken, categoriaController.delete_categoria);

export default router;