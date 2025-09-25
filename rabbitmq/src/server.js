import express from "express";
import { creatOrder } from "./controllers/order.controller.js";

const app = express();
const port = 3002

app.use(express.json());

app.post('/orders', creatOrder);


app.listen(port, ()=>{
    console.log(`Running on ${port}`)
})