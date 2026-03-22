export const prerender = false;

import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

// OBTENER RECURSOS
export const GET = async () => {
  try {
    const comando = new ScanCommand({
      TableName,
      FilterExpression: "begins_with(PK, :p)",
      ExpressionAttributeValues: { ":p": "RECURSO#" }
    });

    const res = await docClient.send(comando);

    return new Response(JSON.stringify(res.Items || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// GUARDAR RECURSO
export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const idUnico = Date.now().toString();

    const comando = new PutCommand({
      TableName,
      Item: {
        PK: `RECURSO#${idUnico}`,
        SK: "CONTENIDO",
        titulo: body.titulo || "Recurso sin título",
        url: body.url || "#",
        tipo: body.tipo || "video",
        materia: body.materia || "General",
        autor: body.autor || "Docente",
        fecha: new Date().toISOString()
      }
    });

    await docClient.send(comando);

    return new Response(JSON.stringify({ mensaje: "Publicado exitosamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error detectado en recursos POST:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};