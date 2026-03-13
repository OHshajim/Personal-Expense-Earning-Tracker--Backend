import express from "express";
import { forgotPassword, login, resetPassword, sendVerificationEmail, signup, verifyEmail } from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);
router.post("/sendVerificationEmail/:id", sendVerificationEmail);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
