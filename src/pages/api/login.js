export const prerender = false;

import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

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

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const password = String(body?.password || "");

    if (!id) {
      return new Response(JSON.stringify({ error: "Debes ingresar un ID válido" }), {
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
    let item = null;

    for (const pk of intentos) {
      const res = await docClient.send(
        new GetCommand({
          TableName,
          Key: { PK: pk, SK: "PERFIL" },
        })
      );

      if (res.Item) {
        item = res.Item;
        break;
      }
    }

    if (!item && /^\d{7,8}$/.test(id)) {
      item = await findAlumnoByNIE(id);
    }

    if (!item) {
      return new Response(JSON.stringify({ error: "Carnet no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (String(item.password || "") !== password) {
      return new Response(JSON.stringify({ error: "Contraseña incorrecta" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const safeItem = { ...item };
    delete safeItem.password;

    return new Response(JSON.stringify(safeItem), {
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
};