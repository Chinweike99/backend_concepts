import express from "express";
import { creatOrder } from "./controllers/order.controller.js";
import { sendOrderNotification } from "./controllers/email.controller.js";

const app = express();
const port = 3002

app.use(express.json());

app.post('/orders', creatOrder);
app.post('/notify', sendOrderNotification);


app.listen(port, ()=>{
    console.log(`Running on ${port}`)
})