import cron from "node-cron";
import { sendNotification } from "./sendPushNotification.js";

import User from "../models/userModel.js";
import Expense from "../models/expenseModel.js";
import Notification from "../models/notificationModel.js";
import History from "../models/historyModel.js";

import { Op } from "sequelize";

// user selected reminder hours
const TIME_SLOTS = { 
    morning: 23, // 9 AM 
    afternoon: 14, // 2 PM 
    evening: 20, // 8 PM 
};

export const startNotificationScheduler = () => {
    // run every hour
    cron.schedule("0 * * * *", async () => {
        console.log("🔔 Notification scheduler running...");

        const now = new Date();
        const currentHour = now.getHours();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        try {
            // 1️⃣ Fetch users
            const users = await User.findAll({
                attributes: ["id", "email", "notificationPreferences"],
            });

            if (!users.length) return;

            const userIds = users.map((u) => u.id);

            // 2️⃣ Fetch expenses for all users
            const expenses = await Expense.findAll({
                where: {
                    UserId: { [Op.in]: userIds },
                    remainingAmount: { [Op.gt]: 0 },
                },
            });

            // 3️⃣ Fetch today's deposits
            const depositsToday = await History.findAll({
                where: {
                    UserId: { [Op.in]: userIds },
                    createdAt: { [Op.gte]: todayStart },
                },
            });

            // 4️⃣ Fetch today's notifications
            const notificationsToday = await Notification.findAll({
                where: {
                    UserId: { [Op.in]: userIds },
                    createdAt: { [Op.gte]: todayStart },
                },
            });

            // ===============================
            // MEMORY GROUPING (VERY FAST)
            // ===============================

            const expenseMap = {};
            expenses.forEach((e) => {
                if (!expenseMap[e.UserId]) expenseMap[e.UserId] = [];
                expenseMap[e.UserId].push(e);
            });

            const depositMap = {};
            depositsToday.forEach((d) => {
                const key = `${d.UserId}-${d.ExpenseId}`;
                depositMap[key] = true;
            });

            const notificationMap = {};
            notificationsToday.forEach((n) => {
                const key = `${n.UserId}-${n.type}`;
                notificationMap[key] = true;
            });

            // ===============================
            // PROCESS USERS
            // ===============================

            await Promise.all(
                users.map(async (user) => {
                    let prefs;

                    try {
                        prefs =
                            typeof user.notificationPreferences === "string"
                                ? JSON.parse(user.notificationPreferences)
                                : user.notificationPreferences;
                    } catch {
                        return;
                    }

                    if (!prefs) return;

                    const userExpenses = expenseMap[user.id] || [];

                    // ===============================
                    // DAILY DEPOSIT REMINDER
                    // ===============================

                    if (prefs?.dailyDeposit?.enabled) {
                        const times = Array.isArray(prefs.dailyDeposit.time)
                            ? prefs.dailyDeposit.time
                            : [prefs.dailyDeposit.time];

                        const shouldSend = times.some(
                            (t) => TIME_SLOTS[t] === currentHour,
                        );

                        if (shouldSend) {
                            const pendingExpenses = userExpenses.filter(
                                (exp) => {
                                    const key = `${user.id}-${exp.id}`;
                                    return !depositMap[key];
                                },
                            );

                            if (pendingExpenses.length) {
                                const notificationKey = `${user.id}-dailyDeposit`;

                                if (!notificationMap[notificationKey]) {
                                    await sendNotification(
                                        user,
                                        "dailyDeposit",
                                        "Daily Deposit Reminder",
                                        "You have pending deposits to make today.",
                                        {
                                            pendingExpenses:
                                                pendingExpenses.map((e) => ({
                                                    id: e.id,
                                                    name: e.name,
                                                    remainingAmount:
                                                        e.remainingAmount,
                                                })),
                                        },
                                    );
                                }
                            }
                        }
                    }

                    // ===============================
                    // BORROW ALERT
                    // ===============================

                    if (prefs?.borrowAlert?.enabled) {
                        const borrowedExpenses = userExpenses.filter(
                            (e) => e.totalBorrowed > 0,
                        );

                        if (borrowedExpenses.length) {
                            const notificationKey = `${user.id}-borrowAlert`;

                            if (!notificationMap[notificationKey]) {
                                await sendNotification(
                                    user,
                                    "borrowAlert",
                                    "Borrow Reminder",
                                    "You need to repay borrowed amounts.",
                                    {
                                        borrowedAmounts: borrowedExpenses.map(
                                            (e) => ({
                                                id: e.id,
                                                amount: e.totalBorrowed,
                                            }),
                                        ),
                                    },
                                );
                            }
                        }
                    }
                }),
            );
        } catch (err) {
            console.error("Notification Scheduler Error:", err);
        }
    });
};
