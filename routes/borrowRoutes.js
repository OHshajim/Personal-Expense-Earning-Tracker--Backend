const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { borrowCheck, createBorrow, getBorrows, repayBorrow } = require("../controllers/borrowController");

const router = express.Router();

router.post("/check", protect, borrowCheck);
router.post("/", protect, createBorrow);
router.get("/", protect, getBorrows);
router.post("/repay", protect, repayBorrow);

module.exports = router;
