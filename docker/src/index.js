
import express from "express";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/todos", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
