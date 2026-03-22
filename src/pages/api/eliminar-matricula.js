export const prerender = false;

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

async function eliminar(body) {
  const PK = String(body?.PK || body?.pk || "").trim().toUpperCase();

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
      TableName,
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
}

export const DELETE = async ({ request }) => {
  try {
    const body = await request.json();
    return await eliminar(body);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al eliminar matrícula" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    return await eliminar(body);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al eliminar matrícula" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};