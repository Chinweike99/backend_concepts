// Creating custom error handler
export class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.name = AppError;
        this.isOperational = true;
    }
}


export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


export const globalErrorHandler = (err, req, res, next) => {
    console.log(err.stack);

    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            status: "Error",
            message: err.message
        })
    }

    //Using MongoDb as example. (lot of validation can be don)
    else if (err.name === "validationError"){
        return res.status(400).json({
            status: 'error',
            message: "validation error"
        })
    }else {
        return res.status(500).json({
            status: 'error',
            message: "Unexpected error"
        })
    }
}


