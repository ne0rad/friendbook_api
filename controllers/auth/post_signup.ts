import { Request, Response } from "express";
import { User } from "../../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export function post_signup(req: Request, res: Response) {
  if (!req?.body?.username || !req.body.password) {
    return res.status(401).json({
      loc: "username",
      msg: "Username/Password was not accepted",
    });
  }

  req.body.username = req.body.username.replace(/\s/g, "");
  User.findOne(
    { username: req.body.username.toLowerCase() },
    (err: Error, user: object) => {
      if (err) {
        res.status(500).send(err);
      } else if (user) {
        res
          .status(401)
          .send({ loc: "username", msg: "Username already exists" });
      } else {
        const newUser = new User({
          username: req.body.username.toLowerCase(),
          display_name: req.body.username,
          password: bcrypt.hashSync(req.body.password, 10),
        });

        const token = jwt.sign(
          {
            _id: newUser._id,
            username: newUser.username,
            token_issued: new Date(),
          },
          process.env.SECRET || "You should change .env SECRET"
        );
        newUser.token = token;

        newUser.save((err: Error) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ token });
          }
        });
      }
    }
  );
}
