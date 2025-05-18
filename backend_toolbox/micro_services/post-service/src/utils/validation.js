import Joi from 'joi';

export const validateCreatePost = (data) => {
    const schema = Joi.object({
        content: Joi.string().min(3).max(5000).required().messages({
            "string.empty": "Email cannot be empty",
            "any.required": "Email is required"
        }),
        mediaUrls: Joi.array().items(Joi.string()).optional()
    })
    return schema.validate(data)
}