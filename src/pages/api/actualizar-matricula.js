export const prerender = false;

import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

function normalizarResponsable(responsable) {
  if (!responsable) return "No asignado";

  if (typeof responsable === "object") {
    return responsable.nombre || responsable.name || "No asignado";
  }

  return String(responsable).trim() || "No asignado";
}

async function actualizar(body) {
  const PK = String(body?.PK || body?.pk || "").trim().toUpperCase();

  if (!PK) {
    return new Response(
      JSON.stringify({ error: "Falta el PK de la matrícula" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const actual = await docClient.send(
    new GetCommand({
      TableName,
      Key: { PK, SK: "PERFIL" },
    })
  );

  if (!actual.Item) {
    return new Response(
      JSON.stringify({ error: "Matrícula no encontrada" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const item = {
    ...actual.Item,
    ...(body.nombre !== undefined ? { nombre: body.nombre } : {}),
    ...(body.nombres !== undefined ? { nombres: body.nombres } : {}),
    ...(body.apellidos !== undefined ? { apellidos: body.apellidos } : {}),
    ...(body.nie !== undefined ? { nie: body.nie } : {}),
    ...(body.responsable !== undefined
      ? { responsable: normalizarResponsable(body.responsable) }
      : {}),
    ...(body.grado !== undefined ? { grado: body.grado } : {}),
    ...(body.seccion !== undefined ? { seccion: body.seccion } : {}),
    ...(body.turno !== undefined ? { turno: body.turno } : {}),
    ...(body.direccion !== undefined ? { direccion: body.direccion } : {}),
    ...(body.salud !== undefined ? { salud: body.salud } : {}),
    ...(body.estadoMatricula !== undefined ? { estadoMatricula: body.estadoMatricula } : {}),
    ...(body.docenteId !== undefined
      ? { docenteId: String(body.docenteId || "").trim().toUpperCase() }
      : {}),
    ...(body.docenteAsignado !== undefined
      ? { docenteAsignado: String(body.docenteAsignado || "").trim() }
      : {}),
    fechaActualizacion: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName,
      Item: item,
    })
  );

  return new Response(JSON.stringify({ mensaje: "Matrícula actualizada", item }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const PUT = async ({ request }) => {
  try {
    const body = await request.json();
    return await actualizar(body);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al actualizar matrícula" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    return await actualizar(body);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al actualizar matrícula" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};