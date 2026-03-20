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

function normalizarTexto(valor) {
  return String(valor || "").trim().toUpperCase();
}

export async function GET({ url }) {
  try {
    const docenteId = normalizarTexto(url.searchParams.get("docenteId"));
    const docenteNombre = normalizarTexto(url.searchParams.get("docenteNombre"));
    const scope = normalizarTexto(url.searchParams.get("scope"));

    const result = await docClient.send(
      new ScanCommand({
        TableName,
      })
    );

    let items = (result.Items || [])
      .filter((item) => item?.SK === "PERFIL")
      .filter((item) => item?.rol === "ALUMNO")
      .filter((item) => /^CPEG\d{6}$/i.test(item?.PK || ""))
      .map((item) => ({
        ...item,
        PK: String(item.PK || "").toUpperCase(),
        docenteId: String(item.docenteId || "").toUpperCase(),
        docenteAsignado: String(item.docenteAsignado || ""),
      }));

    if (scope === "DOCENTE") {
      items = items.filter((item) => {
        const matchById =
          docenteId && normalizarTexto(item.docenteId) === docenteId;

        const matchByName =
          docenteNombre &&
          normalizarTexto(item.docenteAsignado) === docenteNombre;

        return matchById || matchByName;
      });
    }

    items.sort((a, b) => {
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