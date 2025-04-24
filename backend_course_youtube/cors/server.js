import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import cors from "cors";
import { configureCors } from './cors_config.js';


const app = express();

const PORT = process.env.PORT || 3000
app.use(express.json());
app.use(configureCors());


app.get('/', (req, res) => {
    res.send("CORS-enabled server")
})

app.listen(() =>{
    console.log(`Listening on port ${PORT}`);
})