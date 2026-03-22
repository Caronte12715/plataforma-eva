export const prerender = false;

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

export const DELETE = async ({ request }) => {
  try {
    const { pk, sk } = await request.json();

    const PK = String(pk || "").trim().toUpperCase();
    const SK = String(sk || "PERFIL").trim().toUpperCase();

    if (!PK) {
      return new Response(
        JSON.stringify({ error: "Falta el PK del registro a eliminar" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await docClient.send(
      new DeleteCommand({
        TableName,
        Key: { PK, SK },
      })
    );

    return new Response(
      JSON.stringify({ mensaje: "Registro eliminado con éxito" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Error al eliminar registro" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST = DELETE;