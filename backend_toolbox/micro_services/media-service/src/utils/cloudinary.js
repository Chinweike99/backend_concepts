import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv'
import logger from './logger';

cloudinary.config({
    cloud_name : process.env.CLOUDUNARY_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// export const uploadToCloudinary = (file) => {
//     return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream({
//             resource_type : "auto"
//         },
//         (error, result) =>{
//             if(error){
//                 logger.error("Error while uploading media to cloudinary");
//                 reject(error);
//             }else{
//                 resolve(result)
//             }
//         }
//     )
//     uploadStream.end(file.buffer)
//     })
// }

export const uploadToCloud = async (file) => {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
  
        uploadStream.end(file.buffer);
      });
  
      return result;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error; 
    }
  };
  