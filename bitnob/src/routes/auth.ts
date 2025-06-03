import express from 'express';
import { validate } from '../middleware/validate';
import { loginUserSchema, registerUserSchema } from '../types/user.types';
import { loginUser, registerUser } from '../services/auth.service';
import { sendErrorResponse, sendSuccessResponse } from '../utils/apiResponse';


const router = express.Router();

router.post('/register', validate(registerUserSchema), async(req, res) => {
    try {
        const {user, token} = await registerUser(req.body);
        sendSuccessResponse(res, {user, token}, "User registered successfully", 201)
    }  catch (error: any) {
        sendErrorResponse(res, error.message);
    }
})


router.post('/login', validate(loginUserSchema), async(req, res) => {
    try {
        const {user, token} = await loginUser(req.body)
        sendSuccessResponse(res, { user, token }, 'Login successful');
    } catch (error: any) {
        sendErrorResponse(res, error.message);
    }
  });

  export default router;