import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async ( form,to, subject, text) => {
    await transporter.sendMail({
        from: form == null ? process.env.EMAIL_USER : form,
        to,
        subject,
        text,
    });
};

export default sendEmail;
