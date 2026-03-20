<template>
  <div class="w-full max-w-md">
    <div class="bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-8">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-black text-[#002855] uppercase tracking-tight">
          Iniciar sesión
        </h2>
        <p class="text-slate-400 text-sm mt-2">
          Ingresa tu identificador y contraseña
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label
            for="login-id"
            class="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2"
          >
            ID de acceso
          </label>

          <input
            id="login-id"
            v-model="id"
            type="text"
            autocomplete="username"
            placeholder="Ej: 9001, 1001 o CPEG260014"
            class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 font-bold outline-none focus:border-[#002855] focus:ring-2 focus:ring-blue-100 transition-all"
            :disabled="loading"
          />
        </div>

        <div>
          <label
            for="login-password"
            class="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2"
          >
            Contraseña
          </label>

          <input
            id="login-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Ingresa tu contraseña"
            class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-slate-800 font-bold outline-none focus:border-[#002855] focus:ring-2 focus:ring-blue-100 transition-all"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#002855] hover:bg-[#001d3d] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-black uppercase tracking-[0.2em] shadow-xl transition-all"
        >
          {{ loading ? "VALIDANDO..." : "ENTRAR" }}
        </button>
      </form>

      <div
        v-if="error"
        class="mt-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-semibold"
      >
        {{ error }}
      </div>

      <div
        v-if="success"
        class="mt-5 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-semibold"
      >
        Acceso correcto. Redirigiendo...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const id = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const success = ref(false);

function normalizeValue(value, fallback = "") {
  if (value === null || value === undefined || value === "undefined" || value === "null") {
    return fallback;
  }
  return String(value);
}

async function handleLogin() {
  error.value = "";
  success.value = false;

  const cleanId = id.value.trim().toUpperCase();
  const cleanPassword = password.value;

  if (!cleanId) {
    error.value = "Debes ingresar un ID válido.";
    return;
  }

  if (!cleanPassword) {
    error.value = "Debes ingresar tu contraseña.";
    return;
  }

  loading.value = true;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: cleanId, password: cleanPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo iniciar sesión.");
    }

    const rol = normalizeValue(data.rol, "ALUMNO").toUpperCase();

    let dashboardId = "---";

    if (rol === "ALUMNO") {
      dashboardId = normalizeValue(data.PK, "---").toUpperCase();
    } else {
      dashboardId = normalizeValue(data.nie || data.PK, "---").toUpperCase();
    }

    localStorage.setItem("user_name", normalizeValue(data.nombre, "Usuario"));
    localStorage.setItem("user_id", dashboardId);
    localStorage.setItem("user_nie", normalizeValue(data.nie, ""));
    localStorage.setItem("user_pk", normalizeValue(data.PK, ""));
    localStorage.setItem("user_direccion", normalizeValue(data.direccion, "San Miguel, ES"));
    localStorage.setItem("user_encargado", normalizeValue(data.responsable, "No asignado"));
    localStorage.setItem("user_rol", rol);
    localStorage.setItem("user_alergias", normalizeValue(data.salud, "Ninguna"));
    localStorage.setItem("user_grado", normalizeValue(data.grado, "---"));
    localStorage.setItem("user_seccion", normalizeValue(data.seccion, ""));
    localStorage.setItem("user_materia", normalizeValue(data.materia, "General"));
    localStorage.setItem("must_change_password", String(Boolean(data.mustChangePassword)));

    success.value = true;

    setTimeout(() => {
      if (data.mustChangePassword) {
        window.location.href = "/cambiar-password";
      } else {
        window.location.href = "/";
      }
    }, 700);
  } catch (err) {
    error.value = err.message || "Ocurrió un error inesperado.";
  } finally {
    loading.value = false;
  }
}
</script>