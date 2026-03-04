const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");
const Expense = require("./expenseModel");

const Deposit = sequelize.define(
    "Deposit",
    {
        amount: DataTypes.FLOAT,
        purpose: DataTypes.STRING,
    },
    {
        timestamps: true,
    },
);

User.hasMany(Deposit);
Deposit.belongsTo(User);

Expense.hasMany(Deposit);
Deposit.belongsTo(Expense);

module.exports = Deposit;
