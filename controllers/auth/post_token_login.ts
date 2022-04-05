import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function post_token_login(req: Request, res: Response) {
  try {
    const token: string = req?.body?.token;
    if (!token)
      return res.status(401).json({ msg: "Access denied. No token provided." });

    const decoded: any = jwt.verify(
      token,
      process.env.SECRET!
    );
    if (decoded) {
      res.status(200).json({
        token: token,
      });
    } else {
      res.status(401).json({
        msg: "Invalid Token",
      });
    }
  } catch (error) {
    res.status(401).json({
      msg: "Invalid Token",
    });
  }
}
