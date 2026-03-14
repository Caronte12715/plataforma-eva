export const prerender = false;
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIA57WCJ7NERYYHDUDK", 
    secretAccessKey: "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"
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export const POST = async ({ request }) => {
  try {
    // Recibimos la materia además de la nota
    const { pk, nota, materia } = await request.json(); 

    const comando = new UpdateCommand({
      TableName: "PlataformaEva",
      Key: { PK: pk, SK: "PERFIL" },
      // Usamos bracket notation para que la materia sea el nombre de la columna
      UpdateExpression: "set #m = :n",
      ExpressionAttributeNames: { "#m": materia }, 
      ExpressionAttributeValues: { ":n": nota },
    });

    await docClient.send(comando);
    return new Response(JSON.stringify({ mensaje: "Nota guardada" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};