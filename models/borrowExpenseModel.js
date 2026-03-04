const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Borrow = require("./borrowModel");
const Expense = require("./expenseModel");

const BorrowExpense = sequelize.define("BorrowExpense", {
    contributedAmount: DataTypes.FLOAT,
});

Borrow.belongsToMany(Expense, { through: BorrowExpense });
Expense.belongsToMany(Borrow, { through: BorrowExpense });

module.exports = BorrowExpense;
