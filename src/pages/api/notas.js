export const prerender = false;

import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

// OBTENER NOTAS
export const GET = async ({ url }) => {
  try {
    const alumnoId = String(url.searchParams.get("alumnoId") || "").trim().toUpperCase();

    const comando = new ScanCommand({
      TableName,
      FilterExpression: "begins_with(PK, :p)",
      ExpressionAttributeValues: {
        ":p": "NOTA#",
      },
    });

    const res = await docClient.send(comando);

    let items = res.Items || [];

    if (alumnoId) {
      items = items.filter(
        (item) => String(item.alumnoId || "").trim().toUpperCase() === alumnoId
      );
    }

    items.sort((a, b) => {
      const fechaA = a.fecha || "";
      const fechaB = b.fecha || "";
      return fechaB.localeCompare(fechaA);
    });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al obtener notas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// GUARDAR NOTA
export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const idUnico = Date.now().toString();
    const alumnoId = String(body.alumnoId || "").trim().toUpperCase();

    if (!alumnoId) {
      return new Response(
        JSON.stringify({ error: "Falta el ID del alumno" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const comando = new PutCommand({
      TableName,
      Item: {
        PK: `NOTA#${idUnico}`,
        SK: "REGISTRO",
        alumnoId,
        alumnoNombre: body.alumnoNombre || "",
        materia: body.materia || "General",
        periodo: body.periodo || "Periodo 1",
        nota: Number(body.nota || 0),
        observacion: body.observacion || "",
        docenteId: String(body.docenteId || "").trim().toUpperCase(),
        docenteNombre: body.docenteNombre || "",
        fecha: new Date().toISOString(),
      },
    });

    await docClient.send(comando);

    return new Response(
      JSON.stringify({ mensaje: "Nota guardada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al guardar nota:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Error al guardar nota" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};