import { Router } from "express";
import { create } from "../controllers/user.js";

const router = Router();

router.post("/", create);

export default router;
