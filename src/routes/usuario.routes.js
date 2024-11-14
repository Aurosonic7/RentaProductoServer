import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import verifyToken from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.route('/')
  .get(verifyToken, usuarioController.get_all_usuarios)
  .post(verifyToken, upload.single('avatar'), usuarioController.create_usuario);

router.route('/:id')
  .get(verifyToken, usuarioController.get_usuario_by_id)
  .put(verifyToken, upload.single('avatar'), usuarioController.update_usuario)
  .delete(verifyToken, usuarioController.delete_usuario);

export default router;