import { Router, Request, Response } from "express";
import { auth } from "./routes";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("FriendBook API server");
});

router.use("/auth", auth);

export default router;
