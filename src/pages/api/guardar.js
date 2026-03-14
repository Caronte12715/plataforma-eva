export const prerender = false;
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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
    const data = await request.json();

    const comando = new PutCommand({
      TableName: "PlataformaEva",
      Item: {
        PK: `ESTUDIANTE#${data.id}`, // Usamos la misma estructura de PK para el login
        SK: "PERFIL",
        nombre: data.nombre,
        grado: data.grado,
        rol: data.rol, // <--- ESTO ES LO NUEVO: Guarda si es DOCENTE o ESTUDIANTE
        fechaRegistro: new Date().toISOString(),
      },
    });

    await docClient.send(comando);
    return new Response(JSON.stringify({ mensaje: "Usuario guardado" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};