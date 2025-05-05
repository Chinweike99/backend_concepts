import Joi from "joi"


const validateReg = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(40).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required();
    })
    return schema.validate(data);
}