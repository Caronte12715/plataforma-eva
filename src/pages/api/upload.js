export const prerender = false;
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIA57WCJ7NERYYHDUDK",
    secretAccessKey: "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"
  },
});

export const POST = async ({ request }) => {
  try {
    const data = await request.formData();
    const file = data.get("archivo");
    
    if (!file) return new Response("No hay archivo", { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

const uploadParams = {
  Bucket: "plataforma-eva-recursos-david-961406434121-us-east-2-an", // Usa el nombre largo
  Key: fileName,
  Body: buffer,
  ContentType: file.type,
  //ACL: 'public-read' 
};

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generamos la URL real de Amazon S3
    const fileUrl = `https://${uploadParams.Bucket}.s3.us-east-2.amazonaws.com/${fileName}`;

    return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};