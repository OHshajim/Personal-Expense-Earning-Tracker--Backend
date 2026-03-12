const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { postDeposit, getDeposits } = require("../controllers/depositController");

const router = express.Router();

router.post("/", protect, postDeposit);
router.get("/", protect, getDeposits);

export default router;
