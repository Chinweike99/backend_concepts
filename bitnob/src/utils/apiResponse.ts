import { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export const sendSuccessResponse = <T>(res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
) => {
    const response: ApiResponse<T> ={success: true};
    if(message) response.message = message;
    if(data) response.data = data;
    res.status(statusCode)
};

export const sendErrorResponse = (
    res: Response,
    message: string,
    statusCode: number = 400
) => {
    const response: ApiResponse<null> = { success: false, message };
  res.status(statusCode).json(response);
}


