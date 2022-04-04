import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import logger from "morgan";
import http from "http";
dotenv.config();
import { io } from "./socket";

const app: Express = express();
const port = process.env.PORT;
export const httpServer = http.createServer(app);

// CORS settings
var corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

app.use(logger("dev"));
app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.send("FriendBook API server");
});


io.attach(httpServer);

httpServer.listen(port, () => {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `Express + TypeScript Server is running on port ${port}`
  );
});
