



export const urlVersioning = (version) => (req, res, next) => {
    if(req.path.startsWith(`/api/${version}`)){
        next();
    }else {
        res.status(404).json({
            success: false,
            error: "API version is not supported",
        })
    }
} 



export const headVersioning = (version) => (req, res, next) => {
    if(req.get("Accept-Version") === version) {
        next();
    }else{
        res.status(404).json({
            success: false,
            error: "API version is not found"
        })
    }
}

// media-type-based versioning
export const contentTypeVersioning = (version) => (req, res, next) => {
    const contentType = req.get('Content-Type');
    if(contentType && contentType.includes(`application/vnd.api.${version}+json`)){
        next()
    }else{
        res.status(404).json({
            succssess: false,
            error: "API version is not found"
        })
    }
}





