import Notification from "../models/notificationModel.js";
import { sendRealtimeNotification } from "../socket/socketHandler.js";

export const sendNotification = async (
    user,
    type,
    title,
    message,
    additionalData = null,
) => {
    try {
        const res = await Notification.create({
            type,
            title,
            message,
            UserId: user.id,
            additionalData,
        });

        sendRealtimeNotification(user.id, {
            type,
            title,
            message,
            additionalData,
        });
    } catch (err) {
        console.error("Notification Error:", err.message);
        console.error("Full Error:", err);
    }
};
