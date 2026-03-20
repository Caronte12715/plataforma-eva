import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

function normalizarResponsable(responsable) {
  if (!responsable) return "No asignado";

  if (typeof responsable === "object") {
    return responsable.nombre || responsable.name || "No asignado";
  }

  return String(responsable).trim() || "No asignado";
}

export async function PUT({ request }) {
  try {
    const body = await request.json();
    const PK = (body?.PK || "").toString().trim().toUpperCase();

    if (!PK) {
      return new Response(
        JSON.stringify({ error: "Falta el PK de la matrícula" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const TableName = "PlataformaEva";

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
      fechaActualizacion: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName,
        Item: item,
      })
    );

    return new Response(
      JSON.stringify({ mensaje: "Matrícula actualizada", item }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al actualizar matrícula" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}