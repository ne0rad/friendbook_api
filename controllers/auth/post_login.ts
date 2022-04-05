import { Request, Response } from "express";
import { User } from "../../models";
import bcrypt from "bcryptjs";

export function post_login(req: Request, res: Response) {
  if (!req?.body?.username || !req.body.password) {
    return res.status(401).json({
      loc: "password",
      msg: "Invalid Username/Password",
    });
  }

  req.body.username = req.body.username.replace(/\s/g, "");
  User.findOne(
    { username: req.body.username.toLowerCase() },
    (err: Error, user: any) => {
      if (err) {
        res.status(500).send(err);
      } else if (!user) {
        res
          .status(401)
          .send({ loc: "username", msg: "Username does not exist" });
      } else {
        const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
        
        if (!passwordIsValid) {
          res
            .status(401)
            .send({ loc: "password", msg: "Invalid Username/Password" });
        } else {
          res.status(200).send({
            token: user.token,
          });
        }
      }
    }
  );
}

