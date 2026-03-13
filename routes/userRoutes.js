import express from "express";
import {
    getFinancialStatus,
    getUserProfile,
    updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/financial-status", protect, getFinancialStatus);

export default router;
