import Media from "../models/media";
import { uploadToCloudinary } from "../utils/cloudinary";
import logger from "../utils/logger";


export const uploadMedia = async(req, res) => {
    logger.info("Starting Media uploader")
    try {
        //Check if file is present
        if(!req.file){
            res.status(400).json({
                success: false,
                message: "File was not found"
            })
        }

        const {originalName, mimeType, buffer} = req.file;
        const userId = req.user.userId;

        logger.info(`File details: name=${originalName}, type: ${mimeType}`);
        logger.info(`Uploading to cloudinary starting ...`);

        const cloudinaryUploads = await uploadToCloudinary(req.file);
        console.log(`Cloudinary upload successfull. PublicID: ${cloudinaryUploads.public_id}`);

        const newCreatedMedia = new Media({
            publicId: cloudinaryUploads.public_id,
            originalName,
            mimeType,
            url: cloudinaryUploads.secure_url,
            userId
        })

        await newCreatedMedia.save();

        res.status(201).json({
            success: true,
            mediaUrls: newCreatedMedia._id,
            url: newCreatedMedia.url,
            message: "Media saved successfully"
        });



    } catch (error) {
        logger.error("Failed to upload file");
        console.log("Cloudinary error: ", error)
    }
}