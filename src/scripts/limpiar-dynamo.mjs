import { config } from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

config();

const TableName = "PlataformaEva";
const DRY_RUN = false; // pon true si primero quieres solo simular

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

function esAdminValido(item) {
  return item.rol === "ADMIN" && /^ADMIN#9\d{3}$/.test(item.PK || "");
}

function esDocenteValido(item) {
  return item.rol === "DOCENTE" && /^DOCENTE#1\d{3}$/.test(item.PK || "");
}

function esAlumnoValido(item) {
  return item.rol === "ALUMNO" && /^CPEG\d{6}$/.test(item.PK || "");
}

function debeEliminar(item) {
  if (!item?.PK || item?.SK !== "PERFIL") return false;

  if (esAdminValido(item)) return false;
  if (esDocenteValido(item)) return false;
  if (esAlumnoValido(item)) return false;

  return true;
}

async function main() {
  const res = await docClient.send(
    new ScanCommand({
      TableName,
    })
  );

  const items = res.Items || [];
  const eliminar = items.filter(debeEliminar);

  console.log(`Total encontrados: ${items.length}`);
  console.log(`Total a eliminar: ${eliminar.length}`);

  for (const item of eliminar) {
    console.log(`Eliminar -> ${item.PK} / ${item.rol || "SIN_ROL"}`);

    if (!DRY_RUN) {
      await docClient.send(
        new DeleteCommand({
          TableName,
          Key: {
            PK: item.PK,
            SK: item.SK,
          },
        })
      );
    }
  }

  console.log(DRY_RUN ? "Simulación completada" : "Limpieza completada");
}

main().catch((err) => {
  console.error("Error:", err);
});