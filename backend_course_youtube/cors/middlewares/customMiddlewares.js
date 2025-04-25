

export const requestLogger = (req, res, next) => {
    const timeStamp = new Date().toDateString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get("User-Agent");
    console.log(`[${timeStamp}]\n ${method} \n ${url} \n ${userAgent}`);

    next(); // Always call the next function, else the function would stuck
}

export const addTimeStamp = (req, res, next) => {
    req.timeStamp = new Date().toISOString();
    next();
};

