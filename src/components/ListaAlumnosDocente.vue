<template>
  <div class="space-y-6">
    <section class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="stat-card">
        <p class="stat-label">Mis alumnos</p>
        <p class="stat-value">{{ alumnos.length }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Validados</p>
        <p class="stat-value">{{ totalValidados }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Pendientes</p>
        <p class="stat-value">{{ totalPendientes }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Observados</p>
        <p class="stat-value">{{ totalObservados }}</p>
      </div>
    </section>

    <section class="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
            Alumnos asignados
          </h2>
          <p class="text-sm text-slate-500">
            Consulta académica por docente. Solo lectura.
          </p>
        </div>

        <button
          @click="cargarAlumnos"
          :disabled="loading"
          class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#163A63] text-white text-sm font-semibold transition disabled:opacity-60"
        >
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>

      <div class="p-6 bg-slate-50/70 border-b border-slate-200">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <label class="filter-label">Buscar</label>
            <input
              v-model="busqueda"
              type="text"
              class="field"
              placeholder="Buscar por código, nombre, NIE, grado o sección"
            />
          </div>

          <div>
            <label class="filter-label">Estado</label>
            <select v-model="filtroEstado" class="field">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="VALIDADA">Validada</option>
              <option value="OBSERVADA">Observada</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Sección</label>
            <select v-model="filtroSeccion" class="field">
              <option value="">Todas las secciones</option>
              <option v-for="seccion in seccionesDisponibles" :key="seccion" :value="seccion">
                {{ seccion }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="error" class="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="p-8 text-slate-500 text-sm font-medium">
        Cargando alumnos...
      </div>

      <div v-else-if="filtrados.length === 0" class="p-8 text-slate-500 text-sm font-medium">
        No hay alumnos asignados a este docente todavía.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Código</th>
              <th class="th">Alumno</th>
              <th class="th">NIE</th>
              <th class="th">Grado</th>
              <th class="th">Sección</th>
              <th class="th">Estado</th>
              <th class="th">Docente</th>
              <th class="th text-right pr-6">Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="alumno in filtrados"
              :key="alumno.PK"
              class="border-t border-slate-100 hover:bg-slate-50/80 transition"
            >
              <td class="td font-semibold text-[#0B1F3A]">{{ alumno.PK }}</td>
              <td class="td">
                <div class="font-semibold text-slate-800">{{ alumno.nombre || "-" }}</div>
                <div class="text-xs text-slate-400">{{ alumno.turno || "Turno no definido" }}</div>
              </td>
              <td class="td">{{ alumno.nie || "-" }}</td>
              <td class="td">{{ alumno.grado || "-" }}</td>
              <td class="td">{{ alumno.seccion || "-" }}</td>
              <td class="td">
                <span :class="badgeClass(alumno.estadoMatricula)">
                  {{ alumno.estadoMatricula || "PENDIENTE" }}
                </span>
              </td>
              <td class="td">{{ alumno.docenteAsignado || "-" }}</td>
              <td class="td pr-6">
                <div class="flex justify-end">
                  <button class="action-btn btn-view" @click="verDetalle(alumno)">
                    Ver perfil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="detalleAbierto && alumnoSeleccionado" class="overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Perfil del alumno</h3>
            <p class="modal-sub">{{ alumnoSeleccionado.PK }}</p>
          </div>
          <button class="close-btn" @click="cerrarDetalle">✕</button>
        </div>

        <div class="modal-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="info-box">
            <span class="info-label">Nombre</span>
            <span class="info-value">{{ alumnoSeleccionado.nombre || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">NIE</span>
            <span class="info-value">{{ alumnoSeleccionado.nie || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Grado</span>
            <span class="info-value">{{ alumnoSeleccionado.grado || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Sección</span>
            <span class="info-value">{{ alumnoSeleccionado.seccion || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Docente asignado</span>
            <span class="info-value">{{ alumnoSeleccionado.docenteAsignado || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">ID docente</span>
            <span class="info-value">{{ alumnoSeleccionado.docenteId || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Responsable</span>
            <span class="info-value">{{ mostrarResponsable(alumnoSeleccionado.responsable) }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Tel. responsable</span>
            <span class="info-value">{{ alumnoSeleccionado.telefonoResponsable || "-" }}</span>
          </div>

          <div class="info-box md:col-span-2">
            <span class="info-label">Dirección</span>
            <span class="info-value">{{ alumnoSeleccionado.direccion || "-" }}</span>
          </div>

          <div class="info-box md:col-span-2">
            <span class="info-label">Salud</span>
            <span class="info-value">{{ alumnoSeleccionado.salud || "Ninguna" }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const alumnos = ref([]);
const busqueda = ref("");
const filtroEstado = ref("");
const filtroSeccion = ref("");
const loading = ref(false);
const error = ref("");

const detalleAbierto = ref(false);
const alumnoSeleccionado = ref(null);

const docenteId = ref("");
const docenteNombre = ref("");

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();

  return alumnos.value.filter((item) => {
    const cumpleBusqueda =
      !q ||
      [
        item.PK,
        item.nombre,
        item.nie,
        item.grado,
        item.seccion,
        item.estadoMatricula,
        item.docenteAsignado,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));

    const cumpleEstado =
      !filtroEstado.value ||
      (item.estadoMatricula || "PENDIENTE").toUpperCase() === filtroEstado.value;

    const cumpleSeccion =
      !filtroSeccion.value ||
      String(item.seccion || "").toUpperCase() === filtroSeccion.value.toUpperCase();

    return cumpleBusqueda && cumpleEstado && cumpleSeccion;
  });
});

const totalValidados = computed(() =>
  alumnos.value.filter((a) => (a.estadoMatricula || "").toUpperCase() === "VALIDADA").length
);

const totalPendientes = computed(() =>
  alumnos.value.filter((a) => (a.estadoMatricula || "PENDIENTE").toUpperCase() === "PENDIENTE").length
);

const totalObservados = computed(() =>
  alumnos.value.filter((a) => (a.estadoMatricula || "").toUpperCase() === "OBSERVADA").length
);

const seccionesDisponibles = computed(() => {
  const values = alumnos.value
    .map((a) => a.seccion)
    .filter(Boolean)
    .map((v) => String(v).toUpperCase());

  return [...new Set(values)].sort();
});

function mostrarResponsable(responsable) {
  if (!responsable) return "-";
  if (typeof responsable === "object") return responsable.nombre || responsable.name || "-";
  return String(responsable);
}

function badgeClass(estado) {
  const value = (estado || "").toUpperCase();
  if (value === "VALIDADA") return "badge badge-ok";
  if (value === "OBSERVADA") return "badge badge-warn";
  return "badge badge-pending";
}

async function cargarAlumnos() {
  loading.value = true;
  error.value = "";

  try {
    const params = new URLSearchParams();

    if (docenteId.value) params.set("docenteId", docenteId.value);
    if (docenteNombre.value) params.set("docenteNombre", docenteNombre.value);
    params.set("scope", "docente");

    const res = await fetch(`/api/listar-matriculas?${params.toString()}`);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("La API /api/listar-matriculas no devolvió JSON.");
    }

    if (!res.ok) {
      throw new Error(data?.error || "No se pudieron cargar los alumnos.");
    }

    alumnos.value = Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    error.value = err.message || "Ocurrió un error inesperado.";
  } finally {
    loading.value = false;
  }
}

function verDetalle(alumno) {
  alumnoSeleccionado.value = alumno;
  detalleAbierto.value = true;
}

function cerrarDetalle() {
  detalleAbierto.value = false;
  alumnoSeleccionado.value = null;
}

onMounted(() => {
  docenteId.value = String(localStorage.getItem("user_id") || "").toUpperCase();
  docenteNombre.value = String(localStorage.getItem("user_name") || "");
  cargarAlumnos();
});
</script>

<style scoped>
.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.stat-label {
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 0.35rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.field {
  width: 100%;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.field:focus {
  border-color: #163A63;
  box-shadow: 0 0 0 3px rgba(22, 58, 99, 0.08);
}

.filter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.45rem;
}

.th {
  text-align: left;
  padding: 1rem 1.25rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 700;
}

.td {
  padding: 1rem 1.25rem;
  color: #0f172a;
  font-size: 0.92rem;
  vertical-align: middle;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-ok {
  background: #dcfce7;
  color: #166534;
}

.badge-warn {
  background: #fef3c7;
  color: #92400e;
}

.badge-pending {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn {
  border: none;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view {
  background: #e0f2fe;
  color: #075985;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 60;
}

.modal-card {
  width: 100%;
  max-width: 860px;
  background: white;
  border-radius: 1.4rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}

.modal-header {
  background: #0B1F3A;
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.modal-sub {
  margin-top: 0.2rem;
  color: #93c5fd;
  font-size: 0.9rem;
}

.close-btn {
  border: none;
  background: rgba(255,255,255,0.12);
  color: white;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  background: #f8fafc;
}

.info-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}
</style>