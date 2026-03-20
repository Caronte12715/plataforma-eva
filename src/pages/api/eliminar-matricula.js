import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function DELETE({ request }) {
  try {
    const body = await request.json();
    const PK = (body?.PK || "").toString().trim().toUpperCase();

    if (!PK) {
      return new Response(
        JSON.stringify({ error: "Falta el PK de la matrícula" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await docClient.send(
      new DeleteCommand({
        TableName: "PlataformaEva",
        Key: {
          PK,
          SK: "PERFIL",
        },
      })
    );

    return new Response(
      JSON.stringify({ mensaje: "Matrícula eliminada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al eliminar matrícula" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}