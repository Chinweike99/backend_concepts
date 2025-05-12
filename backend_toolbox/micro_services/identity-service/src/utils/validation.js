import Joi from "joi"


export const validateReg = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(40).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data);
}


// export const validateLogin = (data) => {
//     const schema = Joi.object({
//         email: Joi.string().email({tlds: {allow: false}}).required().message({"string.email": "Enter a valid email addrress"}),
//         password: Joi.string().min(6).required().messages({'string.min': "Password should be more than six characters"})
//     });
//     const {error, value} = schema.validate(data);
//     if(error){
//         throw error
//     };
//     return value;
// }


export const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            "string.email": "Enter a valid email address",
            "string.empty": "Email cannot be empty",
            "any.required": "Email is required"
        }),
        password: Joi.string().min(6).required().messages({
            "string.min": "Password should be more than six characters",
            "string.empty": "Password cannot be empty",
            "any.required": "Password is required"
        }),
    });

    return schema.validate(data, { abortEarly: false }); // validate all fields
};