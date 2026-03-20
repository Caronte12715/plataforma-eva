import { config } from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

config();

const TableName = "PlataformaEva";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

async function main() {
  const admin = {
    PK: "ADMIN#9001",
    SK: "PERFIL",
    nombre: "Administrador General",
    nie: "9001",
    direccion: "San Miguel, ES",
    rol: "ADMIN",
    materia: "Administrador",
    responsable: "Gestión institucional",
    grado: "Control total",
    password: "Admin9001!",
    mustChangePassword: false,
    fechaRegistro: new Date().toISOString(),
  };

  const docente = {
    PK: "DOCENTE#1001",
    SK: "PERFIL",
    nombre: "Juan Polanco",
    nie: "1001",
    direccion: "San Miguel, ES",
    rol: "DOCENTE",
    materia: "Docencia",
    responsable: "Consulta académica",
    grado: "Alumnos asignados",
    password: "Doc1001!",
    mustChangePassword: false,
    fechaRegistro: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName, Item: admin }));
  await docClient.send(new PutCommand({ TableName, Item: docente }));

  console.log("Usuarios base creados correctamente");
}
main().catch((err) => {
  console.error("Error:", err);
});