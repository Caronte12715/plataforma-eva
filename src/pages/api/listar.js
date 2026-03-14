export const prerender = false;
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIA57WCJ7NERYYHDUDK",
    secretAccessKey: "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"
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export const GET = async ({ url }) => {
  // CAPTURAMOS EL FILTRO QUE VIENE DE LA TABLA
  const filtroGrado = url.searchParams.get("grado"); 

  try {
    const comando = new ScanCommand({ TableName: "PlataformaEva" });
    const respuesta = await docClient.send(comando);
    let items = respuesta.Items || [];

    // LÓGICA DE PRIVACIDAD: Si el usuario es estudiante, solo le damos su grado
    if (filtroGrado && filtroGrado !== 'null' && filtroGrado !== 'undefined') {
      items = items.filter(alumno => alumno.grado === filtroGrado);
    }

    return new Response(JSON.stringify(items), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};