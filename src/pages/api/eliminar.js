export const prerender = false;
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIA57WCJ7NERYYHDUDK", 
    secretAccessKey: "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"
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export const DELETE = async ({ request }) => {
  try {
    const { pk } = await request.json(); // Recibe el ID (ej: ESTUDIANTE#2026001)

    const comando = new DeleteCommand({
      TableName: "PlataformaEva",
      Key: { 
        PK: pk, 
        SK: "PERFIL" 
      },
    });

    await docClient.send(comando);
    
    return new Response(JSON.stringify({ mensaje: "Registro eliminado con éxito" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error al eliminar:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};