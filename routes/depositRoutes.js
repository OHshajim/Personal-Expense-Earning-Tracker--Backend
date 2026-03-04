const express = require("express");
const sequelize = require("../config/db");
const Expense = require("../models/expenseModel");
const Deposit = require("../models/depositModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
    const { deposits } = req.body;

    await sequelize.transaction(async (t) => {
        for (const item of deposits) {
            if (!item.amount || item.amount <= 0) continue;

            const expense = await Expense.findByPk(item.expenseId);

            expense.totalDeposited += item.amount;
            expense.remainingAmount =
                expense.totalDeposited - expense.totalBorrowed;

            if (expense.totalDeposited >= expense.targetAmount) {
                expense.status = "completed";
            }

            await expense.save({ transaction: t });

            await Deposit.create(
                {
                    amount: item.amount,
                    purpose: item.purpose,
                    UserId: req.user.id,
                    ExpenseId: item.expenseId,
                },
                { transaction: t },
            );
        }
    });

    res.json({ message: "Deposits successful" });
});

module.exports = router;
