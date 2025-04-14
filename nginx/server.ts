import express from 'express';
import {Request, Response} from 'express'
import dotenv from 'dotenv'
dotenv.config();


const app = express();
const port = process.env.PORT || 3000

app.use(express.json());

app.get('/api/health', (req:Request, res: Response) => {
    res.status(200).json({status: "healthy"})
});

app.get('/api/user', (req:Request, res:Response) => {
    const users = [
        {id: 1, name: "Caleb"},
        {id: 2, name: "Dan"},
        {id: 3, name: "Mercy"},
        {id: 4, name: "Philip"},
    ];
    res.json(users);
});


app.listen(port, ()=> {
    console.log(`Sever running on port ${port}`)
})