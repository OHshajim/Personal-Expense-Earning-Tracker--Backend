import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { uploadImage } from "../utils/imageUpload.js";
import { getIoInstance } from "../socket/socketHandler.js";

export const signup = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phone,
            whatsapp,
            ageGroup,
            employmentType
        } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });
        let profileImage = null;
        if (req.file) {
            profileImage = await uploadImage(req.file);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        
        const user = await User.create({
            fullName,
            email,
            profileImage,
            phone,
            whatsapp,
            ageGroup,
            employmentType,
            password: hashedPassword,
            verificationToken,
        });

        const token = generateToken(user);
        
        res.status(201).json({
            message: "Signup successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage,
                phone: user.phone,
                whatsapp: user.whatsapp,
                ageGroup: user.ageGroup,
                employmentType: user.employmentType,
                isVerified: user.isVerified || false,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const sendVerificationEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id } });
        if (!user) return res.status(400).json({ message: "Invalid token" });

        const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify/${user.verificationToken}`;
            await sendEmail(
                user.email,
                "Verify your email",
                `Click to verify: ${verificationLink}`,
        );

        res.json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: { verificationToken: token },
        });

        if (!user) return res.status(400).json({ message: "Invalid token" });

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
        const io = getIoInstance();
        io.to(user.id).emit("userVerified", { userId: user.id, email: user.email });
        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage,
                phone: user.phone,
                whatsapp: user.whatsapp,
                ageGroup: user.ageGroup,
                employmentType: user.employmentType,
                isVerified: user.isVerified || false,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ msg: "User not found" });

        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 5 * 60 * 1000; // 5 min
        await user.save();

        await sendEmail(
            email,
            "Password Reset",
            `Click to reset: http://localhost:3000/reset-password/${token}`,
        );
        
        res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user) return res.status(400).json({ msg: "Invalid token" });
    if (user.resetTokenExpiry < Date.now())
        return res.status(400).json({ msg: "Token expired" });

    // Hash new password
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ msg: "Password reset successfully" });
};