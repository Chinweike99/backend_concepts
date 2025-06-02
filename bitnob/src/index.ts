import express from 'express';
import { connectDb } from './config/db';


const app = express();

connectDb();

app.listen(3000, ()=> {
    console.log("Server started")
})
