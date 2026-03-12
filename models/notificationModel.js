import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";

const Notification = sequelize.define("Notification", {
    type: { type: DataTypes.STRING, allowNull: false }, // dailyDeposit, borrowAlert, lowBalance, completion
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

User.hasMany(Notification);
Notification.belongsTo(User);

export default Notification;
