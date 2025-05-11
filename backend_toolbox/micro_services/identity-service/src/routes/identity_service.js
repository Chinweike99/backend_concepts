import express from 'express';
import * as userAuth from '../controllers/indentity_controller';

const router = express.Router();

router.post('/register', userAuth.registerUser);


export default router;