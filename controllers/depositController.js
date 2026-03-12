import Expense from "../models/expenseModel.js";
import History from "../models/historyModel.js";

export const postDeposit = async (req, res) => {
    try {
        const { deposits } = req.body;

        if (!deposits || deposits.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No deposits provided",
            });
        }

        let totalOutcome = 0;
        const results = [];

        for (const item of deposits) {
            const { expenseId, amount } = item;

            if (!amount || amount <= 0) continue;

            const expense = await Expense.findByPk(expenseId);

            if (!expense) continue;

            const outcome = amount - (expense.dailyOutcome || 0);

            expense.totalDeposited += Number(amount);
            expense.remainingAmount -= Number(amount);
            expense.outcome += outcome;

            if (expense.remainingAmount < 0) {
                expense.remainingAmount = 0;
            }

            await expense.save();

            await History.create({
                type: "deposit",
                amount,
                purpose: expense.title,
                UserId: req.user.id,
                ExpenseId: expenseId,
            });

            totalOutcome += outcome;

            results.push({
                expenseId,
                title: expense.title,
                deposited: amount,
                outcome,
            });
        }

        res.status(201).json({
            success: true,
            message: "Deposits completed",
            totalOutcome,
            deposits: results,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const getDeposits = async (req, res) => {
    try {
        const deposits = await History.findAll({
            where: { UserId: req.user.id, type: "deposit" },
            order: [["createdAt", "DESC"]],
        });
        res.json({ success: true, deposits });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};