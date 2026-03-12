import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";
import Expense from "./expenseModel.js";

const History = sequelize.define(
    "History",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        type: {
            type: DataTypes.ENUM("deposit", "borrow"),
            defaultValue: "deposit",
        },
        amount: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        purpose: DataTypes.STRING,
    },
    {
        timestamps: true,
    },
);

User.hasMany(History);
History.belongsTo(User);

Expense.hasMany(History);
History.belongsTo(Expense);

export default History;
