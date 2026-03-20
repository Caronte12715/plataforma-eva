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
const TableName = "PlataformaEva";

export async function PUT({ request }) {
  try {
    const body = await request.json();

    const PK = String(body?.PK || "").trim().toUpperCase();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!PK) {
      return new Response(JSON.stringify({ error: "Falta el usuario" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "Debes completar ambos campos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "La nueva contraseña debe tener al menos 6 caracteres" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const actual = await docClient.send(
      new GetCommand({
        TableName,
        Key: { PK, SK: "PERFIL" },
      })
    );

    if (!actual.Item) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (String(actual.Item.password || "") !== currentPassword) {
      return new Response(JSON.stringify({ error: "La contraseña actual no coincide" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const actualizado = {
      ...actual.Item,
      password: newPassword,
      mustChangePassword: false,
      fechaActualizacion: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName,
        Item: actualizado,
      })
    );

    return new Response(
      JSON.stringify({ mensaje: "Contraseña actualizada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error al cambiar contraseña" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}