const express = require("express");
const sequelize = require("../config/db");
const Expense = require("../models/expenseModel");
const Borrow = require("../models/borrowModel");
const BorrowExpense = require("../models/borrowExpenseModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
    const { expenseIds, amount, purpose } = req.body;

    await sequelize.transaction(async (t) => {
        const expenses = await Expense.findAll({
            where: { id: expenseIds, UserId: req.user.id },
        });

        const totalAvailable = expenses.reduce(
            (sum, e) => sum + e.remainingAmount,
            0,
        );

        if (amount > totalAvailable)
            throw new Error("Not enough available balance");

        const borrow = await Borrow.create(
            { amount, purpose, UserId: req.user.id },
            { transaction: t },
        );

        for (const expense of expenses) {
            const ratio = expense.remainingAmount / totalAvailable;
            const contribution = ratio * amount;

            expense.totalBorrowed += contribution;
            expense.remainingAmount -= contribution;

            await expense.save({ transaction: t });

            await BorrowExpense.create(
                {
                    BorrowId: borrow.id,
                    ExpenseId: expense.id,
                    contributedAmount: contribution,
                },
                { transaction: t },
            );
        }
    });

    res.json({ message: "Borrow successful" });
});

module.exports = router;
