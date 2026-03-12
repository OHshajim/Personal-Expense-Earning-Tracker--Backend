// controllers/notificationController.js
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import { sendRealtimeNotification } from "../socket/socketHandler.js";

export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { UserId: req.user.id },
            order: [["createdAt", "DESC"]],
        });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        if (!notification)
            return res
                .status(404)
                .json({ success: false, message: "Notification not found" });
        notification.isRead = true;
        await notification.save();
        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
