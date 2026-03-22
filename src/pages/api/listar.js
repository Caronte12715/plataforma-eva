export const prerender = false;

import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

export const GET = async () => {
  try {
    const res = await docClient.send(
      new ScanCommand({
        TableName,
      })
    );

    const items = (res.Items || []).filter((item) => item?.SK === "PERFIL");

    items.sort((a, b) => {
      const fechaA = a.fechaRegistro || "";
      const fechaB = b.fechaRegistro || "";
      return fechaB.localeCompare(fechaA);
    });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al listar registros" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};