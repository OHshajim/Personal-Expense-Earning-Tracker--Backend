import express from "express";
import { postDeposit, getDeposits } from "../controllers/depositController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, postDeposit);
router.get("/", protect, getDeposits);

export default router;
