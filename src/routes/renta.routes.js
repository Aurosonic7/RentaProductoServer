import { Router } from 'express';
import * as rentaController from '../controllers/renta.controller.js';
import verifyToken from '../middlewares/auth.js';

const router = Router();

router.route('/')

export default router;
