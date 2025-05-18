import Post from "../models/Post.js";
import logger from "../utils/logger.js"
import { validateCreatePost } from "../utils/validation.js";



/* Invalidate cache: When creating a new post, we need to always invalidate the cache
 or else, Cached data becomes stale.
When someone hits your GET /posts endpoint:
Redis might still return the old cached list of posts that doesn’t include the new post you just created.
This can confuse users who expect to see their newly created post immediately.
**/
//

const invalidatePostCache = async(req, input) => {
    const keys = await req.redisClient.keys("posts:*");
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
};

const invalidateDeletePostCache = async (req) => {
    const keys = await req.redisClient.keys("posts:*"); // for posts list cache
    const postKeys = await req.redisClient.keys("post:*"); // for individual post caches
    const allKeys = [...keys, ...postKeys];
    
    if (allKeys.length > 0) {
      await req.redisClient.del(...allKeys);
    }
  };
  
  

export const createPost =  async(req, res)=> {
    try {
        const {error} = validateCreatePost(req.body);
        if(error){
            logger.warn("Validating create post error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: "Unable to validate post creation, please add content"
            })
        }

        const {content, mediaUrls} = req.body;
        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaUrls
        })
        
        await newPost.save();
        await invalidatePostCache(req, newPost._id.toString());
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


export const getAllPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if (cachedPosts) {
            return res.json(JSON.parse(cachedPosts)); // ✅ only return if cache exists
        }

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalPosts = await Post.countDocuments();

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts
        };

        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

        res.json(result);
    } catch (error) {
        logger.error("Error getting all posts", error);
        res.status(500).json({
            success: false,
            message: "Error fetching all posts"
        });
    }
};





// Get single post
export const getSinglePost =  async(req, res)=> {
    try {
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);

        if(cachedPost){
            return res.json(JSON.parse(cachedPost))
        };

        const postById = await Post.findById(postId);
        if(!postById){
            res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(postById));
        res.json(postById);

    } catch (error) {
        logger.error("Error getting a post by ID", error);
        res.status(500).json({
            success: false,
            message: "Could not get post post by ID"
        })
    }
}


// Delete single post
// export const deletePost =  async(req, res)=> {
//     try {
//         const delPost = req.params.id;
//         const postById = await Post.findById(delPost);
//         if(!postById){
//             return res.status(404).json({
//                 success: false,
//                 message: "Post not found"
//             })
//         }
//         await Post.findByIdAndDelete(delPost);

//         res.status(200).json({
//             success: true,
//             message: "Post deleted successfully"
//           });
//     } catch (error) {
//         logger.error("Error deleting a post", error);
//         res.status(500).json({
//             success: false,
//             message: "Could not delete post post"
//         })
//     }
// }

export const deletePost = async(req, res)=>{
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
              });
        }

        if(post.user.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post"
            })
        }

        //Delete Post
        await Post.findByIdAndDelete(postId);

        //Invalidate relevant Cache keys
        await invalidateDeletePostCache(req);
        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
          });


    } catch (error) {
        logger.error("Error deleting a post", error);
        res.status(500).json({
          success: false,
          message: "Could not delete post"
        });
    }
}