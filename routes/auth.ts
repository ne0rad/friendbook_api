import { Router, Request, Response } from "express";
const router = Router();

router.get("/login", (req: Request, res: Response) => {
  // TODO : Implement login
  res.send("login");
});

router.get("/signup", (req: Request, res: Response) => {
  // TODO : Implement signup
  res.send("signup");
});

export default router;
