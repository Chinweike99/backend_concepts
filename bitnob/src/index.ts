// import express from 'express';
// import { connectDb } from './config/db';


// const app = express();

// connectDb();

// app.listen(3000, ()=> {
//     console.log("Server started")
// })



import app from './app';
import env from './config/env';
import logger from './utils/logger';

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});