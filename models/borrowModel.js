const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Borrow = sequelize.define("Borrow", {
        amount: DataTypes.FLOAT,
        purpose: DataTypes.STRING,
    },
    {
        timestamps: true,
    }
);

User.hasMany(Borrow);
Borrow.belongsTo(User);

module.exports = Borrow;
