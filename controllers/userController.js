import User from "../models/userModel.js";
import Expense from "../models/expenseModel.js";
import History from "../models/historyModel.js";

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: [
                    "password",
                    "verificationToken",
                    "resetToken",
                    "resetTokenExpiry",
                ],
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            whatsapp,
            employmentType,
            ageGroup,
            currency,
            language,
        } = req.body;

        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: [
                    "password",
                    "verificationToken",
                    "resetToken",
                    "resetTokenExpiry",
                ],
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;
        user.whatsapp = whatsapp || user.whatsapp;
        user.employmentType = employmentType || user.employmentType;
        user.ageGroup = ageGroup || user.ageGroup;
        user.currency = currency || user.currency;
        user.language = language || user.language;

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getFinancialStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            where: { UserId: userId },
        });

        let totalDeposited = 0;
        let totalRemaining = 0;
        let totalOutcome = 0;

        for (const exp of expenses) {
            totalDeposited += Number(exp.totalDeposited || 0);
            totalRemaining += Number(exp.remainingAmount || 0);
            totalOutcome += Number(exp.outcome || 0);
        }

        const totalBorrowed =
            (await History.sum("amount", {
                where: {
                    UserId: userId,
                    type: "borrow",
                },
            })) || 0;

        const base = totalDeposited + totalRemaining || 1;

        let progress = ((totalDeposited - totalBorrowed) / base) * 100;

        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;

        let status = "stable";
        let message = "Your financial condition is healthy.";

        if (progress < 40) {
            status = "critical";
            message = "Your financial condition needs immediate attention.";
        } else if (progress < 75) {
            status = "warning";
            message = "Your financial condition needs monitoring.";
        }

        res.json({
            success: true,

            financialCondition: {
                status,
                message,
                progress: Math.round(progress)
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};