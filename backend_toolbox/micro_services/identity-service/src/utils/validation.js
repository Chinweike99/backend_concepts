import Joi from "joi"


export const validateReg = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(40).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data);
}


export const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email("Enter a valid email addrress"),
        password: Joi.string().min(6, "Password should be more than six characters")
    })
}