import express from "express";
import { forgotPassword, login, resetPassword, signup, verifyEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/sendVerificationEmail/:id", sendVerificationEmail);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
