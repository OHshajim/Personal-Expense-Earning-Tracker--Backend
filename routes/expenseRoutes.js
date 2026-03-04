const express = require("express");
const Expense = require("../models/expenseModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
    const { title, targetAmount } = req.body;

    const expense = await Expense.create({
        title,
        targetAmount,
        UserId: req.user.id,
    });

    res.json(expense);
});

router.get("/", protect, async (req, res) => {
    const expenses = await Expense.findAll({
        where: { UserId: req.user.id },
        order: [["createdAt", "DESC"]],
    });

    res.json(expenses);
});

module.exports = router;
