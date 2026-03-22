export const prerender = false;

import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TableName } from "./dynamo.js";

export const PUT = async ({ request }) => {
  try {
    const body = await request.json();

    const PK = String(body?.PK || body?.pk || "").trim().toUpperCase();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    // 🔴 VALIDACIONES
    if (!PK) {
      return new Response(JSON.stringify({ error: "Falta el usuario (PK)" }), {
        status: 400,
      });
    }

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "Debes completar todos los campos" }), {
        status: 400,
      });
    }

    if (newPassword.length < 4) {
      return new Response(JSON.stringify({ error: "La nueva contraseña es muy corta" }), {
        status: 400,
      });
    }

    // 🔍 BUSCAR USUARIO
    const res = await docClient.send(
      new GetCommand({
        TableName,
        Key: { PK, SK: "PERFIL" },
      })
    );

    const user = res.Item;

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
      });
    }

    // 🔐 VALIDAR PASSWORD ACTUAL
    if (String(user.password || "") !== currentPassword) {
      return new Response(JSON.stringify({ error: "Contraseña actual incorrecta" }), {
        status: 401,
      });
    }

    // ✏️ ACTUALIZAR
    const actualizado = {
      ...user,
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
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }),
      { status: 500 }
    );
  }
};