import Expense from "../models/expenseModel.js";
import History from "../models/historyModel.js";

export const createExpense = async (req, res) => {
    const {
        title,
        targetAmount,
        totalDeposited,
        deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } = req.body;
    if (
        !title ||
        !targetAmount ||
        !deadline ||
        totalDeposited < 0
    ) {
        return res
            .status(400)
            .json({
                success: false,
                error: "Please provide valid expense details",
            });
    }

    try {
        const expense = await Expense.create({
            title,
            targetAmount,
            totalDeposited,
            remainingAmount: targetAmount - totalDeposited,
            UserId: req.user.id,
            deadline,
            dailyOutcome:
                targetAmount /
                Math.ceil(
                    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24),
                ),
        });
        await History.create({
            type: "deposit",
            amount: totalDeposited,
            purpose: title,
            UserId: req.user.id,
            ExpenseId: expense.id,
        });
        res.status(201).json({ success: true, expense });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { UserId: req.user.id },
            order: [["createdAt", "DESC"]],
        });
        res.json({ success: true, expenses });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
