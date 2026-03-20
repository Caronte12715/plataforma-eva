import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TableName = "PlataformaEva";

function buildLookupKeys(idRaw) {
  const id = String(idRaw || "").trim().toUpperCase();

  if (!id) return [];

  if (/^9\d{3}$/.test(id)) return [`ADMIN#${id}`];
  if (/^1\d{3}$/.test(id)) return [`DOCENTE#${id}`];
  if (/^CPEG\d{6}$/.test(id)) return [id];

  return [
    id,
    `ADMIN#${id}`,
    `DOCENTE#${id}`,
    `ESTUDIANTE#${id}`,
    `USER#${id}`,
    `CPEG#${id}`,
  ];
}

async function findAlumnoByNIE(nie) {
  const result = await docClient.send(
    new ScanCommand({
      TableName,
      FilterExpression: "SK = :sk AND rol = :rol AND nie = :nie",
      ExpressionAttributeValues: {
        ":sk": "PERFIL",
        ":rol": "ALUMNO",
        ":nie": String(nie || "").trim(),
      },
    })
  );

  return result.Items?.[0] || null;
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const id = (body?.id || "").toString().trim();
    const password = (body?.password || "").toString();

    if (!id) {
      return new Response(JSON.stringify({ error: "Debes enviar un ID válido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!password) {
      return new Response(JSON.stringify({ error: "Debes ingresar tu contraseña" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const intentos = buildLookupKeys(id);
    let Item = null;

    for (const pk of intentos) {
      const res = await docClient.send(
        new GetCommand({
          TableName,
          Key: { PK: pk, SK: "PERFIL" },
        })
      );

      if (res.Item) {
        Item = res.Item;
        break;
      }
    }

    if (!Item && /^\d{7,8}$/.test(id)) {
      Item = await findAlumnoByNIE(id);
    }

    if (!Item) {
      return new Response(JSON.stringify({ error: "Carnet no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (String(Item.password || "") !== password) {
      return new Response(JSON.stringify({ error: "Contraseña incorrecta" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ...Item,
        password: undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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