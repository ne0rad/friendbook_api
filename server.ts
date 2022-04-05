import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import logger from "morgan";
import http from "http";
import mongoose from "mongoose";
import router from "./router";
import { io } from "./socket";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
export const httpServer = http.createServer(app);

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1/friendbook")
  .then(() => console.log("Connected to MongoDB"));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};
app.use(logger("dev"));
app.use(cors(corsOptions));

app.use(router);

router.use("*", (req: Request, res: Response) => {
  res.status(404).send("Not Found");
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

io.attach(httpServer);

httpServer.listen(port, () => {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `Express + TypeScript Server is running on port ${port}`
  );
});
