import express from 'express';
import * as userAuth from '../controllers/indentity_controller.js';

const router = express.Router();

router.post('/register', userAuth.registerUser);
router.post('/login', userAuth.loginUser)
router.post('/refresh-token', userAuth.userRefreshToken);
router.post('/logout', userAuth.logoutUser);


export default router;