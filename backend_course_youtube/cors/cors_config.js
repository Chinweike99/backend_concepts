/**
 * Advanced CORs setup and permissions.
 */


import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors());
app.use(express());

// export const useCors = () => {
//     app.get('/product/:id', (req, res, next) => {
//         res.json({msg: "This is CORS-enabled for all origins"})
//     })

//     const listen = app.listen(80, () => {
//         console.log("CORs-enabled web server listening on port 80");
//     })
// }

export const configureCors = () => {
    return cors ({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'https://yourcustomdomain.com'
            ]
            if(!origin || allowedOrigins.indexOf(origin) !== -1){
                callback(null, true);
            }else {
                callback(new Error ("Not allowed by cors"))
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept-Version'
        ],

        // This tells all the headers that can be exposed to a client..
        exposedHeaders: [
            'Content-Range',
            'X-Content-Range'
        ],

        credentials: true, // Enables support for cookies and Authorization headers.
        preflightContinue: false,  //If false, cors would handle pre-flight authomatically
        maxAge: 600,
        optionsSuccessStatus: 204
    })
}