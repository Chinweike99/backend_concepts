import express from 'express';
import { v4 as uuidv4 } from 'uuid';



const app = express()
const PORT = process.env.PORT || 3001;

//Generate a unique server ID when this instance starts
const SERVER_ID = uuidv4().slice(0, 8);
app.use(express.json());


// add CORS headers middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Method", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", 'Origin, X-requested-With, Content-Type, Accept');
    next();
});


app.get('/api/hello', (req, res) =>{
    // Log the request to the console
    console.log(`[${new Date().toISOString()}] Recieved request from ${req.ip}`);

    //Simulate some processing time (100-500);
    const processingTime = Math.floor(Math.random() * 400) + 100;
    setTimeout(() => {
        res.json({
            message: "Hello from the API service !",
            serverId: SERVER_ID,
            timestamp: new Date().toISOString()
        })
    }, processingTime)
})

app.get('/api/health', (req, res) => {
    res.status(200).json({status: "healthy", serverId: SERVER_ID});
});


app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
    console.log(`Server ID on Port ${SERVER_ID}`);
})

