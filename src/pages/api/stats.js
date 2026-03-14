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

export const GET = async () => {
  try {
    const { Items } = await docClient.send(new ScanCommand({ TableName: "PlataformaEva" }));
    
    // Lógica para agrupar y contar por grado
    const conteo = Items.reduce((acc, alumno) => {
      acc[alumno.grado] = (acc[alumno.grado] || 0) + 1;
      return acc;
    }, {});

    return new Response(JSON.stringify(conteo), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};