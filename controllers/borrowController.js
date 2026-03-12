import Expense from "../models/expenseModel.js";
import History from "../models/historyModel.js";
import Expense from "../models/expenseModel.js";

export const borrowCheck = async (req, res) => {
    try {
        const { expenseIds } = req.body;

        if (!expenseIds || expenseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one expense",
            });
        }

        const expenses = await Expense.findAll({
            where: { id: expenseIds },
        });

        if (!expenses.length) {
            return res.status(404).json({
                success: false,
                message: "Expenses not found",
            });
        }

        let totalDeposited = 0;
        let totalBorrowable = 0;

        const details = [];

        for (const exp of expenses) {
            const deposited = Number(exp.totalDeposited);

            totalDeposited += deposited;

            // keep minimum 1
            const borrowable = deposited > 1 ? deposited - 1 : 0;

            totalBorrowable += borrowable;

            details.push({
                expenseId: exp.id,
                title: exp.title,
                deposited,
                borrowable,
            });
        }

        if (totalBorrowable <= 0) {
            return res.status(400).json({
                success: false,
                message: "You cannot borrow because deposits would reach zero",
            });
        }

        res.json({
            success: true,
            totalDeposited,
            totalBorrowable,
            expenses: details,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createBorrow = async (req, res) => {
    try {
        const { expenseIds, borrowAmount, borrowPurpose } = req.body;
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            where: { id: expenseIds, userId },
        });

        if (!expenses.length) {
            return res.status(404).json({
                success: false,
                message: "Expenses not found",
            });
        }

        const totalDeposited = expenses.reduce(
            (sum, exp) => sum + Number(exp.totalDeposited),
            0,
        );

        if (borrowAmount > totalDeposited) {
            return res.status(400).json({
                success: false,
                message: "Borrow exceeds total deposit",
            });
        }

        for (const expense of expenses) {
            const weight = expense.totalDeposited / totalDeposited;

            let borrowShare = borrowAmount * weight;

            const maxBorrow = expense.totalDeposited - 1;

            if (borrowShare > maxBorrow) {
                borrowShare = maxBorrow;
            }

            borrowShare = Math.round(borrowShare);

            expense.totalDeposited -= borrowShare;
            expense.borrowedAmount += borrowShare;

            await expense.save();

            // save history (LOSS)
            await History.create({
                type: "borrow",
                amount: borrowShare,
                purpose: borrowPurpose,
                UserId: userId,
                ExpenseId: expense.id,
            });
        }

        res.status(201).json({
            success: true,
            message: "Borrow completed",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBorrows = async (req, res) => {
    try {
        const borrowHistory = await History.findAll({
            where: { UserId: req.user.id, type: "borrow" },
            include: [{ model: Expense, attributes: ["title"] }],
        });
        res.json({
            success: true,
            borrowHistory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const repayBorrow = async (req, res) => {
    try {
        const { repayments } = req.body;

        if (!repayments || repayments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No repayments provided",
            });
        }

        for (const item of repayments) {
            const { expenseId, amount } = item;

            if (!amount || amount <= 0) continue;

            const expense = await Expense.findOne({
                where: {
                    id: expenseId,
                    userId: req.user.id,
                },
            });

            if (!expense) continue;

            // update balances
            expense.totalDeposited += Number(amount);
            expense.remainingAmount -= Number(amount);
            expense.borrowedAmount -= Number(amount);
            expense.outcome -= Number(amount);

            if (expense.borrowedAmount < 0) {
                expense.borrowedAmount = 0;
            }

            if (expense.remainingAmount < 0) {
                expense.remainingAmount = 0;
            }

            await expense.save();

            // save history
            await History.create({
                type: "deposit",
                amount,
                purpose: expense.title,
                UserId: req.user.id,
                ExpenseId: expenseId,
            });
        }

        res.json({
            success: true,
            message: "Repayments completed"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};