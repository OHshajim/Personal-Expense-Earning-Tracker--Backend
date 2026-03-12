import History from "../models/historyModel.js";
import Expense from "../models/expenseModel.js";

export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await History.findAll({
            where: { UserId: userId },
            include: [
                {
                    model: Expense,
                    attributes: [
                        "category",
                        "totalDeposited",
                        "remainingAmount",
                        "targetAmount",
                        "totalBorrowed",
                        "outcome",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]], // latest first
        });

        res.json({
            success: true,
            history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
