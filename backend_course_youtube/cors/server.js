import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
// import cors from "cors";
import { configureCors } from './cors_config.js';
import { addTimeStamp, requestLogger } from './middlewares/customMiddlewares.js';
import { globalErrorHandler } from './middlewares/errorhandlers.js';
import { contentTypeVersioning, headVersioning, urlVersioning } from './middlewares/apiVersioning.js';
import { rateLimiter } from './middlewares/rateLimiting.js';

const app = express();
const PORT = process.env.PORT || 3000

// Middlewares
app.use(requestLogger);
app.use(addTimeStamp);

app.use(express.json());
app.use(configureCors());
app.use(rateLimiter(100, 15*60*1000)) // Max of 100 requests in 15 minutes

app.use('/api/v1', urlVersioning("v1"));
app.use('api/v2', headVersioning("v2"));
app.use('/api/v', contentTypeVersioning("v"));

app.use(globalErrorHandler);


app.get('/', (req, res) => {
    res.send("CORS-enabled server")
})

app.listen(() =>{
    console.log(`Listening on port ${PORT}`);
})