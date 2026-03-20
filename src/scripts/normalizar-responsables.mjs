import { config } from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

config();

const TableName = "PlataformaEva";
const DRY_RUN = false; // pon true para simular sin guardar cambios

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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

async function main() {
  const res = await docClient.send(
    new ScanCommand({
      TableName,
    })
  );

  const items = res.Items || [];

  const alumnos = items.filter(
    (item) =>
      item?.SK === "PERFIL" &&
      item?.rol === "ALUMNO" &&
      /^CPEG\d{6}$/i.test(item?.PK || "")
  );

  console.log(`Total alumnos válidos encontrados: ${alumnos.length}`);

  let modificados = 0;

  for (const item of alumnos) {
    const responsableActual = item.responsable;

    if (typeof responsableActual === "object" || !responsableActual) {
      const nuevoResponsable = normalizarResponsable(responsableActual);

      const actualizado = {
        ...item,
        PK: String(item.PK).toUpperCase(),
        responsable: nuevoResponsable,
        fechaActualizacion: new Date().toISOString(),
      };

      console.log(
        `[${item.PK}] responsable:`,
        responsableActual,
        "=>",
        nuevoResponsable
      );

      if (!DRY_RUN) {
        await docClient.send(
          new PutCommand({
            TableName,
            Item: actualizado,
          })
        );
      }

      modificados++;
    }
  }

  console.log(
    DRY_RUN
      ? `Simulación completada. Se modificarían ${modificados} registros.`
      : `Normalización completada. Se modificaron ${modificados} registros.`
  );
}

main().catch((err) => {
  console.error("Error:", err);
});