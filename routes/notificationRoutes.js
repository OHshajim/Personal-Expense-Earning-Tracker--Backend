import express from "express";
import {
    deleteAllNotifications,
    deleteNotification,
    getUserNotifications,
    markNotificationRead,
    markNotificationReadAll,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.patch("/:id/readAll", protect, markNotificationReadAll);
router.delete("/:id", protect, deleteNotification);
router.delete("/deleteAll", protect, deleteAllNotifications);

export default router;

