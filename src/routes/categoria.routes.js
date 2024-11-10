import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

<<<<<<< HEAD
=======
// Aplicar verifyToken a todas las rutas de categorías
>>>>>>> refs/remotes/origin/develop
router.route('/')
  .get(verifyToken, categoriaController.get_categorias)
  .post(verifyToken, categoriaController.create_categoria);

router.route('/:id')
<<<<<<< HEAD
  .get(verifyToken, categoriaController.get_categoria_by_id)
=======
>>>>>>> refs/remotes/origin/develop
  .put(verifyToken, categoriaController.update_categoria)
  .delete(verifyToken, categoriaController.delete_categoria);

export default router;