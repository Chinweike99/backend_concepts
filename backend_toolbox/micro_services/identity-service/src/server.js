import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./utils/logger";
import express from 'express'

const app = express();

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => logger.info("connected to mongoDB"))
  .catch((e) => logger.error("MogoDb connection error", e));




  app.listen()