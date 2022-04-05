import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IRequest extends Request {
  user: string | JwtPayload;
}

export default function verify_token() {
  return (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const token: string = req.header("Authorization")!;
      if (!token)
        return res
          .status(401)
          .send({ msg: "Access denied. No token provided." });

      const decoded = jwt.verify(
        token,
        process.env.SECRET || "You should change this secret"
      );
      req["user"] = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        msg: "Invalid Token",
      });
    }
  };
}
