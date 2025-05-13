import Post from "../models/Post";
import logger from "../utils/logger"





//
export const createPost =  async(req, res)=> {
    try {
        const {content, mediaUrls} = req.body;
        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaUrls
        })
        
        await newPost.save();
        logger.info("Post creation successful")
        res.status(201).json({
            success: true,
            message: "Post created successfully"
        });

    } catch (error) {
        logger.error("Error creating post", error);
        res.status(500).json({
            success: false,
            message: "Error creating post"
        })
    }
}


// Get all posts
export const getAllPost =  async(req, res)=> {
    try {
        
    } catch (error) {
        logger.error("Error getting all posts", error);
        res.status(500).json({
            success: false,
            message: "Error fetching all posts"
        })
    }
};




// Get single post
export const getSinglePost =  async(req, res)=> {
    try {
        
    } catch (error) {
        logger.error("Error getting a post by ID", error);
        res.status(500).json({
            success: false,
            message: "Could not get post post by ID"
        })
    }
}


// Get single post
export const deletePost =  async(req, res)=> {
    try {
        
    } catch (error) {
        logger.error("Error deleting a post", error);
        res.status(500).json({
            success: false,
            message: "Could not delete post post"
        })
    }
}