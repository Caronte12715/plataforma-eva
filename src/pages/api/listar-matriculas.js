import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TableName = "PlataformaEva";

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName,
      })
    );

    const items = (result.Items || [])
      .filter((item) => item?.SK === "PERFIL")
      .filter((item) => item?.rol === "ALUMNO")
      .filter((item) => /^CPEG\d{6}$/i.test(item?.PK || ""))
      .map((item) => ({
        ...item,
        PK: String(item.PK || "").toUpperCase(),
      }))
      .sort((a, b) => {
        const fechaA = a.fechaRegistro || "";
        const fechaB = b.fechaRegistro || "";
        return fechaB.localeCompare(fechaA);
      });

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Error al listar matrículas",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}