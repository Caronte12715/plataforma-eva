import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

function buildLookupKeys(idRaw) {
  const id = String(idRaw || "").trim().toUpperCase();

  if (!id) return [];

  if (/^9\d{3}$/.test(id)) {
    return [`ADMIN#${id}`];
  }

  if (/^1\d{3}$/.test(id)) {
    return [`DOCENTE#${id}`];
  }

  if (/^CPEG\d{6}$/.test(id)) {
    return [id];
  }

  return [
    id,
    `ADMIN#${id}`,
    `DOCENTE#${id}`,
    `ESTUDIANTE#${id}`,
    `USER#${id}`,
    `CPEG#${id}`,
  ];
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const id = (body?.id || "").toString().trim();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Debes enviar un ID válido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const TableName = "PlataformaEva";
    const intentos = buildLookupKeys(id);

    let Item = null;

    for (const pk of intentos) {
      const command = new GetCommand({
        TableName,
        Key: {
          PK: pk,
          SK: "PERFIL",
        },
      });

      const res = await docClient.send(command);

      if (res.Item) {
        Item = res.Item;
        break;
      }
    }

    if (!Item) {
      return new Response(
        JSON.stringify({ error: "Carnet no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(Item), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}