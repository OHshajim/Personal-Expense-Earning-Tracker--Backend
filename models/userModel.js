import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        phone: {
            type: DataTypes.STRING,
        },

        whatsapp: {
            type: DataTypes.STRING,
        },

        employmentType: {
            type: DataTypes.STRING,
        },

        ageGroup: {
            type: DataTypes.STRING,
        },

        profileImage: {
            type: DataTypes.STRING,
        },

        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        resetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        resetTokenExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        lastOnline: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        currency: {
            type: DataTypes.STRING,
            defaultValue: "USD",
        },

        language: {
            type: DataTypes.STRING,
            defaultValue: "en",
        },

        notificationPreferences: {
            type: DataTypes.JSON,
            defaultValue: {
                dailyDeposit: {
                    enabled: true,
                    time: ["morning", "afternoon", "evening"],
                },
                borrowAlert: {
                    enabled: true,
                },
                warningAlert: {
                    enabled: true,
                    threshold: 50,
                },
                completionAlert: {
                    enabled: true,
                },
                channel: ["push"], // push, email, sms
            },
        },
    },
    {
        timestamps: true,
    },
);

export default User;
