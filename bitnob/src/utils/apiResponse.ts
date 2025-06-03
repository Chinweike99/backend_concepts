import { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[]
};

export const sendSuccessResponse = <T>(res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
) => {
    const response: ApiResponse<T> ={success: true};
    if(message) response.message = message;
    if(data) response.data = data;
    res.status(statusCode).json(response)
};

export const sendErrorResponse = (
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: any[]
) => {
    const response: ApiResponse<null> = { success: false, message };
    if(errors) response.errors = errors
  res.status(statusCode).json(response);
}


