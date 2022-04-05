import { Request, Response } from "express";

export function post_login(req: Request, res: Response) {
  // TODO : Implement login
  console.log(req);
  res.send("login");
}
