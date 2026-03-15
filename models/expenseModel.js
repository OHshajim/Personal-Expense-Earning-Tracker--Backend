import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";

const Expense = sequelize.define(
    "Expense",
    {
        title: DataTypes.STRING,
        targetAmount: DataTypes.FLOAT,
        totalDeposited: { type: DataTypes.FLOAT, defaultValue: 0 },
        totalBorrowed: { type: DataTypes.FLOAT, defaultValue: 0 },
        remainingAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
        status: { type: DataTypes.STRING, defaultValue: "active" },
        outcome: { type: DataTypes.FLOAT, defaultValue: 0 },
        deadline: DataTypes.DATE,
        dailyOutcome: { type: DataTypes.FLOAT, defaultValue: 0 }
    },
    {
        timestamps: true,
    },
);

User.hasMany(Expense);
Expense.belongsTo(User);

export default Expense;
