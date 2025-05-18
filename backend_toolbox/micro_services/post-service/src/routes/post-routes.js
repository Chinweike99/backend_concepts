import express from 'express';
import * as postController from '../controllers/post-controllers.js'
import { authicateRequest } from '../middleware/authMiddleware.js';

const router = express.Router();


// Create a middleware to tell if a user is an Authenticated user or not



router.use(authicateRequest)
router.post('/create-post', postController.createPost);
router.get('/getall-posts', postController.getAllPost)
router.get('/:id', postController.getSinglePost);
router.delete('/delete/:id', postController.deletePost);

export default router;


