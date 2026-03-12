import express from "express";
import { getUserHistory } from "../controllers/historyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUserHistory);

export default router;
