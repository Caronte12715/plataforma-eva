export const prerender = false;

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = import.meta.env.AWS_REGION || "us-east-2";
const accessKeyId = import.meta.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("Faltan credenciales AWS en las variables de entorno");
}

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);
export const TableName = "PlataformaEva";