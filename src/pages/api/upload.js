export const prerender = false;

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const POST = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get("archivo");

    if (!file) {
      return new Response(JSON.stringify({ error: "No hay archivo" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Tipo de archivo no permitido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const uploadParams = {
      Bucket: import.meta.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${uploadParams.Bucket}.s3.${import.meta.env.AWS_REGION || "us-east-2"}.amazonaws.com/${fileName}`;

    return new Response(JSON.stringify({ url: fileUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};