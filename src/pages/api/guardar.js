export const prerender = false;

import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

const ALUMNO_BASE = 260001;

function formatearCodigoAlumno(numero) {
  return `CPEG${String(numero).padStart(6, "0")}`.toUpperCase();
}

function normalizarResponsable(responsable) {
  if (!responsable) return "No asignado";

  if (typeof responsable === "object") {
    return responsable.nombre || responsable.name || "No asignado";
  }

  return String(responsable).trim() || "No asignado";
}

async function generarSiguienteCodigoAlumno() {
  const scan = await docClient.send(
    new ScanCommand({
      TableName,
      ProjectionExpression: "PK, rol",
    })
  );

  const items = scan.Items || [];

  const codigos = items
    .filter((item) => item?.rol === "ALUMNO" && /^CPEG\d{6}$/i.test(item?.PK || ""))
    .map((item) => Number(String(item.PK).toUpperCase().replace("CPEG", "")))
    .filter((n) => Number.isFinite(n));

  if (codigos.length === 0) return formatearCodigoAlumno(ALUMNO_BASE);

  return formatearCodigoAlumno(Math.max(...codigos) + 1);
}

export const POST = async ({ request }) => {
  try {
    const datos = await request.json();
    const nuevoPK = await generarSiguienteCodigoAlumno();

    const item = {
      PK: nuevoPK,
      SK: "PERFIL",

      nombre: datos.nombre || "Sin nombre",
      nombres: datos.nombres || "",
      apellidos: datos.apellidos || "",
      nie: datos.nie || "",
      direccion: datos.direccion || "No especificada",

      rol: "ALUMNO",
      grado: datos.grado || "---",
      seccion: datos.seccion || "",
      materia: datos.materia || "General",
      turno: datos.turno || "Matutino",

      docenteId: String(datos.docenteId || "").trim().toUpperCase(),
      docenteAsignado: String(datos.docenteAsignado || "").trim(),

      fechaNacimiento: datos.fechaNacimiento || "",
      sexo: datos.sexo || "",
      telefonoEstudiante: datos.telefonoEstudiante || "",

      responsable: normalizarResponsable(datos.responsable),
      parentesco: datos.parentesco || "",
      duiResponsable: datos.duiResponsable || "",
      telefonoResponsable: datos.telefonoResponsable || "",

      salud: datos.salud || "Ninguna",
      medicamento: datos.medicamento || "Ninguno",
      observacionesMedicas: datos.observacionesMedicas || "",

      documentos: datos.documentos || {
        partidaNacimiento: false,
        certificadoNotas: false,
        duiResponsable: false,
        nie: false,
      },

      archivoNombre: datos.archivoNombre || "",
      estadoMatricula: datos.estadoMatricula || "PENDIENTE",
      fechaMatricula: datos.fechaMatricula || "",
      fechaRegistro: new Date().toISOString(),

      password: nuevoPK,
      mustChangePassword: true,
    };

    await docClient.send(
      new PutCommand({
        TableName,
        Item: item,
      })
    );

    return new Response(
      JSON.stringify({
        mensaje: "Guardado correctamente",
        item,
        credencialTemporal: {
          usuario: nuevoPK,
          passwordTemporal: nuevoPK,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al guardar matrícula" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};