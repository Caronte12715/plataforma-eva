export const prerender = false;
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIA57WCJ7NERYYHDUDK",
    secretAccessKey: "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"
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export const GET = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) return new Response(null, { status: 400 });

  try {
    // Intentamos buscarlo como ESTUDIANTE#ID (formato estándar de tu tabla)
    const { Item } = await docClient.send(new GetCommand({
      TableName: "PlataformaEva",
      Key: { PK: `ESTUDIANTE#${id}`, SK: "PERFIL" }
    }));

    if (!Item) {
      return new Response(JSON.stringify({ error: "El ID no existe en Ohio" }), { status: 404 });
    }

    return new Response(JSON.stringify(Item), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};