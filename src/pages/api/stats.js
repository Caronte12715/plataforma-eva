export const prerender = false;

import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

export const GET = async () => {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName })
    );

    const items = result.Items || [];

    const alumnos = items.filter(
      (item) =>
        item?.SK === "PERFIL" &&
        item?.rol === "ALUMNO" &&
        /^CPEG\d{6}$/i.test(item?.PK || "")
    );

    const porGrado = alumnos.reduce((acc, alumno) => {
      const grado = alumno.grado || "Sin grado";
      acc[grado] = (acc[grado] || 0) + 1;
      return acc;
    }, {});

    const porEstado = alumnos.reduce((acc, alumno) => {
      const estado = alumno.estadoMatricula || "PENDIENTE";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    return new Response(
      JSON.stringify({
        total: alumnos.length,
        porGrado,
        porEstado,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al obtener estadísticas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};