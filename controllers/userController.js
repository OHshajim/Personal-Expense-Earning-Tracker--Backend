import User from "../models/userModel.js";

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: [
                    "password",
                    "verificationToken",
                    "resetToken",
                    "resetTokenExpiry",
                ],
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            whatsapp,
            employmentType,
            ageGroup,
            currency,
            language,
        } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;
        user.whatsapp = whatsapp || user.whatsapp;
        user.employmentType = employmentType || user.employmentType;
        user.ageGroup = ageGroup || user.ageGroup;
        user.currency = currency || user.currency;
        user.language = language || user.language;

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};