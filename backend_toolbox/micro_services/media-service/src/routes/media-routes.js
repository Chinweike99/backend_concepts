import express from 'express';
import multer from 'multer';
import { authicateRequest } from '../middleware/authMiddleware';
import logger from '../utils/logger';
import { uploadMedia } from '../controllers/media-controller';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('file');


router.post('/upload', authicateRequest, (req, res, next) => {
    upload(req, res, (err)=> {
        if(err instanceof multer.MulterError){
            logger.error("Multer error occured");
            logger.error("Multer error occurred", { error: err.message });
            res.status(400).json({
                success: false,
                message: "Unable to upload file"
            })
            console.log("An error occured during upload");
        }else if(err) {
            logger.error("Unknown error occurred while uploading media file");
            res.status(500).json({
                success: false,
                message: "Unable to upload file, Unknown error occurred"
            })
        }

        if(!req.file){
            return next(new Error("No file was found"));
        }

        next();
    })
}, uploadMedia);


export default router;