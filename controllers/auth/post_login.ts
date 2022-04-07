import { Request, Response } from "express";
import { User } from "../../models";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";

export const post_login = [
  check("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .isLength({ max: 20 })
    .withMessage("Username must be at most 20 characters long")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric")
    .custom((value) => {
      return User.exists({ username: value }).then((user) => {
        if (!user) {
          return Promise.reject("Username doesn't exist");
        }
      });
    }),
  check("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long")
    .isLength({ max: 50 })
    .withMessage("Password must be at most 50 characters long"),

  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('got errors')
      const error = errors.array()[0];
      return res.status(401).json({ loc: error.param, msg: error.msg });
    }

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
              .json({ loc: "password", msg: "Invalid Username/Password" });
          } else {
            res.status(200).json({
              token: user.token,
            });
          }
        }
      }
    );
  },
];
