<template>
  <div class="space-y-6">
    <!-- RESUMEN -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card-stat">
        <p class="stat-label">Total matrículas</p>
        <p class="stat-value">{{ alumnos.length }}</p>
      </div>

      <div class="card-stat">
        <p class="stat-label">Validadas</p>
        <p class="stat-value">{{ totalValidadas }}</p>
      </div>

      <div class="card-stat">
        <p class="stat-label">Pendientes</p>
        <p class="stat-value">{{ totalPendientes }}</p>
      </div>
    </section>

    <!-- PANEL PRINCIPAL -->
    <section class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">
            Matrículas registradas
          </h2>
          <p class="text-sm text-slate-500">
            Revisión y administración de estudiantes matriculados
          </p>
        </div>

        <button
          @click="cargarMatriculas"
          :disabled="loading"
          class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#163A63] text-white text-sm font-semibold transition disabled:opacity-60"
        >
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>

      <div class="p-6 border-b border-slate-200 bg-slate-50/70">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <label class="filter-label">Buscar</label>
            <input
              v-model="busqueda"
              type="text"
              class="field"
              placeholder="Buscar por código, nombre, NIE, grado o responsable"
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
        </div>
      </div>

      <div v-if="error" class="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {{ error }}
      </div>

      <div v-if="success" class="mx-6 mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        {{ success }}
      </div>

      <div v-if="loading" class="p-8 text-slate-500 text-sm font-medium">
        Cargando matrículas...
      </div>

      <div v-else-if="filtrados.length === 0" class="p-8 text-slate-500 text-sm font-medium">
        No hay matrículas registradas todavía.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Código</th>
              <th class="th">Estudiante</th>
              <th class="th">NIE</th>
              <th class="th">Grado</th>
              <th class="th">Responsable</th>
              <th class="th">Estado</th>
              <th class="th">Fecha</th>
              <th class="th text-right pr-6">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="alumno in filtrados"
              :key="alumno.PK"
              class="border-t border-slate-100 hover:bg-slate-50/80 transition"
            >
              <td class="td">
                <div class="font-semibold text-[#0B1F3A]">
                  {{ alumno.PK }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ alumno.seccion ? `Sección ${alumno.seccion}` : "Sin sección" }}
                </div>
              </td>

              <td class="td">
                <div class="font-semibold text-slate-800">
                  {{ alumno.nombre || "-" }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ alumno.turno || "Turno no definido" }}
                </div>
              </td>

              <td class="td">{{ alumno.nie || "-" }}</td>
              <td class="td">{{ alumno.grado || "-" }}</td>
              <td class="td">{{ mostrarResponsable(alumno.responsable) }}</td>

              <td class="td">
                <span :class="badgeClass(alumno.estadoMatricula)">
                  {{ alumno.estadoMatricula || "PENDIENTE" }}
                </span>
              </td>

              <td class="td">
                {{ formatFecha(alumno.fechaMatricula || alumno.fechaRegistro) }}
              </td>

              <td class="td pr-6">
                <div class="flex justify-end flex-wrap gap-2">
                  <button class="action-btn btn-view" @click="verDetalle(alumno)">
                    Ver
                  </button>
                  <button class="action-btn btn-edit" @click="abrirEdicion(alumno)">
                    Editar
                  </button>
                  <button class="action-btn btn-delete" @click="eliminarMatricula(alumno)">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MODAL DETALLE -->
    <div v-if="detalleAbierto && alumnoSeleccionado" class="overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Detalle de matrícula</h3>
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
            <span class="info-label">Turno</span>
            <span class="info-value">{{ alumnoSeleccionado.turno || "-" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Modalidad</span>
            <span class="info-value">{{ alumnoSeleccionado.materia || "-" }}</span>
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

          <div class="info-box">
            <span class="info-label">Estado</span>
            <span class="info-value">{{ alumnoSeleccionado.estadoMatricula || "PENDIENTE" }}</span>
          </div>

          <div class="info-box">
            <span class="info-label">Fecha</span>
            <span class="info-value">{{ formatFecha(alumnoSeleccionado.fechaMatricula || alumnoSeleccionado.fechaRegistro) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDICIÓN -->
    <div v-if="edicionAbierta" class="overlay">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Editar matrícula</h3>
            <p class="modal-sub">{{ editForm.PK }}</p>
          </div>
          <button class="close-btn" @click="cerrarEdicion">✕</button>
        </div>

        <div class="modal-body grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="filter-label">Nombres</label>
            <input v-model="editForm.nombres" class="field" type="text" />
          </div>

          <div>
            <label class="filter-label">Apellidos</label>
            <input v-model="editForm.apellidos" class="field" type="text" />
          </div>

          <div>
            <label class="filter-label">NIE</label>
            <input v-model="editForm.nie" class="field" type="text" />
          </div>

          <div>
            <label class="filter-label">Responsable</label>
            <input v-model="editForm.responsable" class="field" type="text" />
          </div>

          <div>
            <label class="filter-label">Grado</label>
            <select v-model="editForm.grado" class="field">
              <option>1er Año</option>
              <option>2do Año</option>
              <option>3er Año</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Sección</label>
            <select v-model="editForm.seccion" class="field">
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Turno</label>
            <select v-model="editForm.turno" class="field">
              <option>Matutino</option>
              <option>Vespertino</option>
              <option>Nocturno</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Estado</label>
            <select v-model="editForm.estadoMatricula" class="field">
              <option>PENDIENTE</option>
              <option>VALIDADA</option>
              <option>OBSERVADA</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="filter-label">Dirección</label>
            <input v-model="editForm.direccion" class="field" type="text" />
          </div>

          <div class="md:col-span-2">
            <label class="filter-label">Salud / alergias</label>
            <input v-model="editForm.salud" class="field" type="text" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="secondary-btn" @click="cerrarEdicion">Cancelar</button>
          <button class="primary-btn" :disabled="saving" @click="guardarEdicion">
            {{ saving ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";

const alumnos = ref([]);
const busqueda = ref("");
const filtroEstado = ref("");
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const success = ref("");

const detalleAbierto = ref(false);
const edicionAbierta = ref(false);
const alumnoSeleccionado = ref(null);

const editForm = reactive({
  PK: "",
  nombres: "",
  apellidos: "",
  nie: "",
  responsable: "",
  grado: "1er Año",
  seccion: "A",
  turno: "Matutino",
  direccion: "",
  salud: "Ninguna",
  estadoMatricula: "PENDIENTE",
});

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
        mostrarResponsable(item.responsable),
        item.estadoMatricula,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));

    const cumpleEstado =
      !filtroEstado.value ||
      (item.estadoMatricula || "PENDIENTE").toUpperCase() === filtroEstado.value;

    return cumpleBusqueda && cumpleEstado;
  });
});

const totalValidadas = computed(() =>
  alumnos.value.filter((a) => (a.estadoMatricula || "").toUpperCase() === "VALIDADA").length
);

const totalPendientes = computed(() =>
  alumnos.value.filter((a) => (a.estadoMatricula || "PENDIENTE").toUpperCase() === "PENDIENTE").length
);

function mostrarResponsable(responsable) {
  if (!responsable) return "-";
  if (typeof responsable === "object") return responsable.nombre || responsable.name || "-";
  return String(responsable);
}

function formatFecha(valor) {
  if (!valor) return "-";
  return String(valor).slice(0, 10);
}

function badgeClass(estado) {
  const value = (estado || "").toUpperCase();
  if (value === "VALIDADA") return "badge badge-ok";
  if (value === "OBSERVADA") return "badge badge-warn";
  return "badge badge-pending";
}

async function cargarMatriculas() {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetch("/api/listar-matriculas");
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("La API /api/listar-matriculas no devolvió JSON. Revisa el archivo src/pages/api/listar-matriculas.js");
    }

    if (!res.ok) {
      throw new Error(data?.error || "No se pudieron cargar las matrículas.");
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

function obtenerNombres(nombreCompleto = "") {
  const partes = String(nombreCompleto).trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 2) return partes[0] || "";
  return partes.slice(0, 2).join(" ");
}

function obtenerApellidos(nombreCompleto = "") {
  const partes = String(nombreCompleto).trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return "";
  if (partes.length === 2) return partes[1];
  return partes.slice(2).join(" ");
}

function abrirEdicion(alumno) {
  editForm.PK = alumno.PK || "";
  editForm.nombres = alumno.nombres || obtenerNombres(alumno.nombre);
  editForm.apellidos = alumno.apellidos || obtenerApellidos(alumno.nombre);
  editForm.nie = alumno.nie || "";
  editForm.responsable = mostrarResponsable(alumno.responsable);
  editForm.grado = alumno.grado || "1er Año";
  editForm.seccion = alumno.seccion || "A";
  editForm.turno = alumno.turno || "Matutino";
  editForm.direccion = alumno.direccion || "";
  editForm.salud = alumno.salud || "Ninguna";
  editForm.estadoMatricula = alumno.estadoMatricula || "PENDIENTE";

  edicionAbierta.value = true;
}

function cerrarEdicion() {
  edicionAbierta.value = false;
}

async function guardarEdicion() {
  error.value = "";
  success.value = "";
  saving.value = true;

  try {
    const payload = {
      PK: editForm.PK,
      nombres: editForm.nombres,
      apellidos: editForm.apellidos,
      nombre: `${editForm.nombres} ${editForm.apellidos}`.trim(),
      nie: editForm.nie,
      responsable: editForm.responsable,
      grado: editForm.grado,
      seccion: editForm.seccion,
      turno: editForm.turno,
      direccion: editForm.direccion,
      salud: editForm.salud,
      estadoMatricula: editForm.estadoMatricula,
    };

    const res = await fetch("/api/actualizar-matricula", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo actualizar la matrícula.");
    }

    success.value = "Matrícula actualizada correctamente.";
    edicionAbierta.value = false;
    await cargarMatriculas();
  } catch (err) {
    error.value = err.message || "Ocurrió un error inesperado.";
  } finally {
    saving.value = false;
  }
}

async function eliminarMatricula(alumno) {
  error.value = "";
  success.value = "";

  const confirmado = window.confirm(`¿Seguro que deseas eliminar la matrícula ${alumno.PK}?`);
  if (!confirmado) return;

  try {
    const res = await fetch("/api/eliminar-matricula", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        PK: alumno.PK,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo eliminar la matrícula.");
    }

    success.value = `Matrícula ${alumno.PK} eliminada correctamente.`;
    await cargarMatriculas();
  } catch (err) {
    error.value = err.message || "Ocurrió un error inesperado.";
  }
}

onMounted(() => {
  cargarMatriculas();
});
</script>

<style scoped>
.card-stat {
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

.btn-edit {
  background: #ede9fe;
  color: #5b21b6;
}

.btn-delete {
  background: #fee2e2;
  color: #b91c1c;
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

.modal-wide {
  max-width: 980px;
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

.modal-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  justify-content: end;
  gap: 0.8rem;
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

.secondary-btn,
.primary-btn {
  border: none;
  border-radius: 0.9rem;
  padding: 0.85rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn {
  background: #e2e8f0;
  color: #0f172a;
}

.primary-btn {
  background: #0B1F3A;
  color: white;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>