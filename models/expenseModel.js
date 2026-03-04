const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Expense = sequelize.define(
    "Expense",
    {
        title: DataTypes.STRING,
        targetAmount: DataTypes.FLOAT,
        totalDeposited: { type: DataTypes.FLOAT, defaultValue: 0 },
        totalBorrowed: { type: DataTypes.FLOAT, defaultValue: 0 },
        remainingAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
        status: { type: DataTypes.STRING, defaultValue: "active" },
    },
    {
        timestamps: true,
    },
);

User.hasMany(Expense);
Expense.belongsTo(User);

module.exports = Expense;
