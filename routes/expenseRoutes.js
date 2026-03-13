import express from "express";

import { createExpense, getExpenses } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);

export default router;
