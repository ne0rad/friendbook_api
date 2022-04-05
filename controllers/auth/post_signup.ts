import { Request, Response } from "express";
import { User } from "../../models";
import { UserType } from "../../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";

function generateToken(user: UserType): string {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      date_issued: new Date(),
    },
    process.env.SECRET!
  );
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export const post_signup = [
  check("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .isLength({ max: 20 })
    .withMessage("Username must be at most 20 characters long"),
  check("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long")
    .isLength({ max: 50 })
    .withMessage("Password must be at most 50 characters long"),

  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = errors.array()[0];
      return res.status(401).json({ loc: error.param, msg: error.msg });
    }

    User.findOne(
      { username: req.body.username.toLowerCase() },
      (err: Error, user: UserType) => {
        if (err)
          res
            .status(401)
            .json({ loc: "username", msg: "Username already exists" });
        else if (user)
          res
            .status(401)
            .json({ loc: "username", msg: "Username already exists" });
        else {
          const newUser = new User({
            username: req.body.username.toLowerCase(),
            display_name: req.body.username,
            password: hashPassword(req.body.password),
          });

          const token = generateToken(newUser);
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
  },
];
