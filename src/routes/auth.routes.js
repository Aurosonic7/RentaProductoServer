import { Router } from "express";
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.route('/register').post(authController.register_user);
router.route('/login').post(authController.login_user);
router.route('/loginByName').post(authController.login_user_name);

export default router;