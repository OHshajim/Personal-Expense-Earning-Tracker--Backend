import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";

export const uploadToCloudflare = async (file) => {
    try {
        // convert image to WEBP
        const webpBuffer = await sharp(file.buffer)
            .resize(800, 800, { fit: "inside" }) // optional resize
            .webp({ quality: 80 })
            .toBuffer();

        const form = new FormData();

        form.append("file", webpBuffer, {
            filename: "image.webp",
            contentType: "image/webp",
        });

        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/images/v1`,
            form,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
                    ...form.getHeaders(),
                },
            },
        );

        return response.data.result.variants[0];
    } catch (error) {
        console.error(error);
        throw new Error("Image upload failed");
    }
};
