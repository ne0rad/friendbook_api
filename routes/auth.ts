import { Router } from "express";
import { post_login, post_signup, post_token_login } from "../controllers/auth";

const router = Router();

router.post("/login", post_login);
router.post("/signup", post_signup);
router.post("/token_login", post_token_login);

export default router;
