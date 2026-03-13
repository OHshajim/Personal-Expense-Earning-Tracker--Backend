import Notification from "../models/notificationModel.js";
import sendEmail from "./sendEmail.js";
import { sendRealtimeNotification } from "../socket/socketHandler.js";

export const sendNotification = async (user, type, title, message) => {
    const { notificationPreferences } = user;

    // Check user preference
    if (!notificationPreferences[type]) return;

    // Save to DB
    await Notification.create({ type, title, message, UserId: user.id });

    // Real-time push
    if (notificationPreferences.channel.includes("push")) {
        sendRealtimeNotification(user.id, { type, title, message });
    }

    // Email
    if (notificationPreferences.channel.includes("email")) {
        await sendEmail(user.email, title, message);
    }
};
