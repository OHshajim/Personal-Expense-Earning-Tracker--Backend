import express from "express";
import {
  borrowCheck,
    createBorrow,
    getBorrows,
    repayBorrow,
} from "../controllers/borrowController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check", protect, borrowCheck);
router.post("/", protect, createBorrow);
router.get("/", protect, getBorrows);
router.post("/repay", protect, repayBorrow);

export default router;
