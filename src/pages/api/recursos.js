export const prerender = false;
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIA57WCJ7NERYYHDUDK",
    secretAccessKey: "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"
  },
});
const docClient = DynamoDBDocumentClient.from(client);

// OBTENER RECURSOS
export const GET = async () => {
  try {
    const comando = new ScanCommand({ 
        TableName: "PlataformaEva",
        FilterExpression: "begins_with(PK, :p)",
        ExpressionAttributeValues: { ":p": "RECURSO#" }
    });
    const res = await docClient.send(comando);
    return new Response(JSON.stringify(res.Items), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

// GUARDAR RECURSO (CON PROTECCIÓN DE DATOS)
export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const idUnico = Date.now().toString();

    const comando = new PutCommand({
      TableName: "PlataformaEva",
      Item: {
        PK: `RECURSO#${idUnico}`,
        SK: "CONTENIDO",
        titulo: body.titulo || "Recurso sin título",
        url: body.url || "#",
        tipo: body.tipo || "video",
        materia: body.materia || "General",
        autor: body.autor || "Docente",
        fecha: new Date().toISOString()
      }
    });

    await docClient.send(comando);
    return new Response(JSON.stringify({ mensaje: "Publicado exitosamente" }), { status: 200 });
  } catch (error) {
    // Esto te ayudará a ver el error real en la terminal si vuelve a fallar
    console.error("Error detectado en AWS POST:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};