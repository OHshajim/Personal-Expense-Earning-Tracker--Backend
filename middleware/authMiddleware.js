import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        // Convert Sequelize instance to plain object
        const userData = user.toJSON();

        // Parse notificationPreferences if it's a string
        if (typeof userData.notificationPreferences === "string") {
            userData.notificationPreferences = JSON.parse(
                userData.notificationPreferences,
            );
        }

        // Remove sensitive info
        delete userData.password;
        delete userData.resetToken;
        delete userData.resetTokenExpiry;
        delete userData.verificationToken;

        req.user = userData;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};
