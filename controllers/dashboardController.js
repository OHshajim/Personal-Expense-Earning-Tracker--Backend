import Expense from "../models/expenseModel.js";
import { Op } from "sequelize";

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Total Deposited
        const totalDeposited = await Expense.sum("totalDeposited", {
            where: { userId },
        });

        // Total Remaining
        const totalRemaining = await Expense.sum("remainingAmount", {
            where: { userId },
        });

        // Total Borrowed
        const totalBorrowed = await Expense.sum("totalBorrowed", {
            where: { userId },
        });

        const totalProfit = await Expense.sum("outcome", {
            where: {
                userId,
                outcome: {
                    [Op.gt]: 0,
                },
            },
        });

        // Total Loss (negative outcome)
        const totalLoss = await Expense.sum("outcome", {
            where: {
                userId,
                outcome: {
                    [Op.lt]: 0,
                },
            },
        });

        res.json({
            success: true,
            stats: {
                totalDeposited: totalDeposited || 0,
                totalBorrowed: totalBorrowed || 0,
                totalRemaining: totalRemaining || 0,
                totalLoss: totalLoss || 0,
                totalProfit: totalProfit || 0,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
