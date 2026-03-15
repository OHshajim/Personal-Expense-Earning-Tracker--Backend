import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/support", protect, async (req, res) => {
    try {
        const { subject, message } = req.body;

        await sendEmail(
            req.user.email,
            process.env.SUPPORT_EMAIL,
            process.env.SUPPORT_EMAIL,
            `Support Request from ${req.user.name}: ${subject}`,
            `User: ${req.user.name} (${req.user.email})\n\nMessage:\n${message}`
        );

        res.status(201).json({ message: "Support request submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting support request" });
    }
});

export default router;