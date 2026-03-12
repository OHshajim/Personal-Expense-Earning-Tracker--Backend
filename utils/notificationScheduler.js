// utils/notificationScheduler.js
import cron from "node-cron";
import User from "../models/userModel.js";
import { sendNotification } from "./sendPushNotification.js";
import Expense from "../models/expenseModel.js";
import History from "../models/historyModel.js";

export const startNotificationScheduler = () => {
    // Run every hour
    cron.schedule("0 * * * *", async () => {
        const users = await User.findAll();

        for (const user of users) {
            // Daily deposit reminder: Check expenses with remaining deposit
            const pendingExpenses = await Expense.findAll({
                where: { UserId: user.id, remainingAmount: { [Op.gt]: 0 } },
            });
            if (
                pendingExpenses.length &&
                user.notificationPreferences.dailyDeposit
            ) {
                await sendNotification(
                    user,
                    "dailyDeposit",
                    "Daily Deposit Reminder",
                    "You have pending deposits to make today.",
                );
            }

            // Borrow alerts
            const borrowableExpenses = await Expense.findAll({
                where: { UserId: user.id, totalDeposited: { [Op.gt]: 0 } },
            });
            if (
                borrowableExpenses.length &&
                user.notificationPreferences.borrowAlert
            ) {
                await sendNotification(
                    user,
                    "borrowAlert",
                    "Borrow Reminder",
                    "You have borrowable amounts available.",
                );
            }

            // Low balance / warning
            const totalRemaining = pendingExpenses.reduce(
                (sum, e) => sum + e.remainingAmount,
                0,
            );
            if (
                totalRemaining < 50 &&
                user.notificationPreferences.lowBalance
            ) {
                // example threshold
                await sendNotification(
                    user,
                    "lowBalance",
                    "Low Balance Warning",
                    "Your remaining deposits are low!",
                );
            }

            // Completion
            const completedExpenses = await Expense.findAll({
                where: { UserId: user.id, remainingAmount: 0 },
            });
            for (const exp of completedExpenses) {
                if (user.notificationPreferences.completion) {
                    await sendNotification(
                        user,
                        "completion",
                        "Expense Completed",
                        `Your expense "${exp.title}" is fully completed.`,
                    );
                }
            }
        }
    });
};
