const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

exports.signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser)
            return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            verificationToken,
        });

        const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;

        await sendEmail(
            email,
            "Verify your email",
            `Click to verify: ${verificationLink}`,
        );

        res.status(201).json({
            message: "Signup successful. Please verify your email.",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: { verificationToken: token },
        });

        if (!user) return res.status(400).json({ message: "Invalid token" });

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        if (!user.isVerified)
            return res
                .status(403)
                .json({ message: "Please verify your email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
