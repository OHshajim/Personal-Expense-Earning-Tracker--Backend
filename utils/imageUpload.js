import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();
export const uploadImage = async (file) => {
    const buffer = await sharp(file.buffer)
        .resize(400, 400, {
            fit: "cover",
        })
        .webp({ quality: 80 })
        .toBuffer();
    const fileName = Date.now() + ".webp";

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: "image/webp",
    });
    await r2.send(command);
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
};
