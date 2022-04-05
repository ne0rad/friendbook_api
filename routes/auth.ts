import { Router } from "express";
import { post_login, post_signup } from "../controllers/auth";

const router = Router();

router.post("/login", post_login);
router.post("/signup", post_signup);

export default router;
