import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import cors from "cors";
import { configureCors } from './cors_config.js';
import { addTimeStamp, requestLogger } from './middlewares/customMiddlewares.js';
import { globalErrorHandler } from './middlewares/errorhandlers.js';


const app = express();
const PORT = process.env.PORT || 3000

// Middlewares
app.use(requestLogger);
app.use(addTimeStamp);

app.use(express.json());
app.use(configureCors());

app.use(globalErrorHandler);


app.get('/', (req, res) => {
    res.send("CORS-enabled server")
})

app.listen(() =>{
    console.log(`Listening on port ${PORT}`);
})