import express from "express";
import { createExpense, getExpenses } from "../controllers/expenseController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);

export default router;
