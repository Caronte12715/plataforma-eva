import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import 'dotenv/config';

// 1. Conexión a AWS
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// 2. Función para guardar
const guardarEstudiante = async () => {
  const command = new PutCommand({
    TableName: "PlataformaEva", // El nombre que pusiste en la consola
    Item: {
      PK: "ESTUDIANTE#2026001", // Partition Key [cite: 121]
      SK: "PERFIL",             // Sort Key
      nombre: "David Alexander", // Datos del alumno [cite: 11]
      grado: "2do Año",
      correo: "david.guevara@colegioeva.edu.sv",
      fechaRegistro: new Date().toISOString()
    },
  });

  try {
    const response = await docClient.send(command);
    console.log("✅ ¡Estudiante guardado con éxito!", response);
  } catch (error) {
    console.error("❌ Error al guardar:", error);
  }
};

guardarEstudiante();