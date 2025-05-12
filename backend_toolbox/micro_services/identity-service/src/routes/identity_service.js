import express from 'express';
import * as userAuth from '../controllers/indentity_controller.js';

const router = express.Router();

router.post('/register', userAuth.registerUser);
router.post('/login', userAuth.loginUser)


export default router;