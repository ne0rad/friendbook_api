import { Request, Response } from "express";
import { User } from "../../models";

export function post_signup(req: Request, res: Response) {
  // TODO : Implement signup
  User.findOne(
    { username: req.body.username.toLowerCase().trim() },
    (err: Error, user: object) => {
      if (err) {
        res.status(500).send(err);
      } else if (user) {
        res.status(400).send("User already exists");
      } else {
        const newUser = new User({
          username: req.body.username.toLowerCase(),
          display_name: req.body.username,
          password: req.body.password,
        });

        newUser.save((err: Error, savedUser: object) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send(savedUser);
          }
        });
      }
    }
  );
}
