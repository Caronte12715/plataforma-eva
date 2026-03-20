<template>
  <div class="w-full">
    <div class="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
      <div class="bg-[#002855] px-10 py-8 border-b-[8px] border-[#fbbf24]">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 class="text-white text-4xl font-black italic tracking-tight uppercase">
              Matrículas registradas
            </h2>
            <p class="text-yellow-400 text-sm font-black italic uppercase mt-2 tracking-wide">
              Panel administrativo de estudiantes matriculados
            </p>
          </div>

          <div class="bg-white/10 border border-white/20 rounded-[2rem] px-8 py-5 min-w-[220px]">
            <p class="text-white/70 text-[10px] uppercase font-black italic">Total registrados</p>
            <p class="text-yellow-400 text-3xl font-black italic mt-1">
              {{ alumnos.length }}
            </p>
          </div>
        </div>
      </div>

      <div class="p-8 bg-[#f8fafc]">
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <input
            v-model="busqueda"
            type="text"
            class="field flex-1"
            placeholder="Buscar por nombre, NIE, código o responsable"
          />

          <select v-model="filtroEstado" class="field lg:w-[220px]">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VALIDADA">Validada</option>
            <option value="OBSERVADA">Observada</option>
          </select>

          <button
            @click="cargarMatriculas"
            :disabled="loading"
            class="bg-[#002855] hover:bg-[#001d3d] disabled:opacity-60 text-white px-6 py-4 rounded-[1.25rem] font-black uppercase tracking-[0.15em]"
          >
            {{ loading ? "Cargando..." : "Actualizar" }}
          </button>
        </div>

        <div v-if="error" class="mb-5 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 font-semibold">
          {{ error }}
        </div>

        <div v-if="success" class="mb-5 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-700 font-semibold">
          {{ success }}
        </div>

        <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 text-slate-500 font-bold">
          Cargando matrículas...
        </div>

        <div v-else-if="filtrados.length === 0" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 text-slate-500 font-bold">
          No hay matrículas registradas todavía.
        </div>

        <div v-else class="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100">
              <tr>
                <th class="th">Código</th>
                <th class="th">Nombre</th>
                <th class="th">NIE</th>
                <th class="th">Grado</th>
                <th class="th">Sección</th>
                <th class="th">Responsable</th>
                <th class="th">Estado</th>
                <th class="th">Fecha</th>
                <th class="th">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="alumno in filtrados"
                :key="alumno.PK"
                class="border-t border-slate-100 hover:bg-slate-50"
              >
                <td class="td font-black text-[#002855]">{{ alumno.PK }}</td>
                <td class="td">{{ alumno.nombre || "-" }}</td>
                <td class="td">{{ alumno.nie || "-" }}</td>
                <td class="td">{{ alumno.grado || "-" }}</td>
                <td class="td">{{ alumno.seccion || "-" }}</td>
                <td class="td">{{ mostrarResponsable(alumno.responsable) }}</td>
                <td class="td">
                  <span :class="badgeClass(alumno.estadoMatricula)">
                    {{ alumno.estadoMatricula || "PENDIENTE" }}
                  </span>
                </td>
                <td class="td">{{ formatFecha(alumno.fechaMatricula || alumno.fechaRegistro) }}</td>
                <td class="td">
                  <div class="flex flex-wrap gap-2">
                    <button class="mini-btn mini-btn-view" @click="verDetalle(alumno)">
                      Ver
                    </button>
                    <button class="mini-btn mini-btn-edit" @click="abrirEdicion(alumno)">
                      Editar
                    </button>
                    <button class="mini-btn mini-btn-delete" @click="eliminarMatricula(alumno)">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal detalle -->
    <div v-if="detalleAbierto && alumnoSeleccionado" class="overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Detalle de matrícula</h3>
            <p class="modal-sub">{{ alumnoSeleccionado.PK }}</p>
          </div>
          <button class="close-btn" @click="cerrarDetalle">✕</button>
        </div>

        <div class="modal-body grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="info-box"><span class="info-label">Nombre</span><span class="info-value">{{ alumnoSeleccionado.nombre || "-" }}</span></div>
          <div class="info-box"><span class="info-label">NIE</span><span class="info-value">{{ alumnoSeleccionado.nie || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Grado</span><span class="info-value">{{ alumnoSeleccionado.grado || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Sección</span><span class="info-value">{{ alumnoSeleccionado.seccion || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Turno</span><span class="info-value">{{ alumnoSeleccionado.turno || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Modalidad</span><span class="info-value">{{ alumnoSeleccionado.materia || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Fecha nacimiento</span><span class="info-value">{{ alumnoSeleccionado.fechaNacimiento || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Sexo</span><span class="info-value">{{ alumnoSeleccionado.sexo || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Responsable</span><span class="info-value">{{ mostrarResponsable(alumnoSeleccionado.responsable) }}</span></div>
          <div class="info-box"><span class="info-label">Tel. responsable</span><span class="info-value">{{ alumnoSeleccionado.telefonoResponsable || "-" }}</span></div>
          <div class="info-box md:col-span-2"><span class="info-label">Dirección</span><span class="info-value">{{ alumnoSeleccionado.direccion || "-" }}</span></div>
          <div class="info-box md:col-span-2"><span class="info-label">Salud</span><span class="info-value">{{ alumnoSeleccionado.salud || "Ninguna" }}</span></div>
          <div class="info-box md:col-span-2"><span class="info-label">Observaciones médicas</span><span class="info-value">{{ alumnoSeleccionado.observacionesMedicas || "-" }}</span></div>
          <div class="info-box"><span class="info-label">Estado</span><span class="info-value">{{ alumnoSeleccionado.estadoMatricula || "PENDIENTE" }}</span></div>
          <div class="info-box"><span class="info-label">Fecha matrícula</span><span class="info-value">{{ formatFecha(alumnoSeleccionado.fechaMatricula || alumnoSeleccionado.fechaRegistro) }}</span></div>
        </div>
      </div>
    </div>

    <!-- Modal edición -->
    <div v-if="edicionAbierta" class="overlay">
      <div class="modal-card modal-wide">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Editar matrícula</h3>
            <p class="modal-sub">{{ editForm.PK }}</p>
          </div>
          <button class="close-btn" @click="cerrarEdicion">✕</button>
        </div>

        <div class="modal-body grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="label">Nombres</label>
            <input v-model="editForm.nombres" class="field" type="text" />
          </div>

          <div>
            <label class="label">Apellidos</label>
            <input v-model="editForm.apellidos" class="field" type="text" />
          </div>

          <div>
            <label class="label">NIE</label>
            <input v-model="editForm.nie" class="field" type="text" />
          </div>

          <div>
            <label class="label">Responsable</label>
            <input v-model="editForm.responsable" class="field" type="text" />
          </div>

          <div>
            <label class="label">Grado</label>
            <select v-model="editForm.grado" class="field">
              <option>1er Año</option>
              <option>2do Año</option>
              <option>3er Año</option>
            </select>
          </div>

          <div>
            <label class="label">Sección</label>
            <select v-model="editForm.seccion" class="field">
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>

          <div>
            <label class="label">Turno</label>
            <select v-model="editForm.turno" class="field">
              <option>Matutino</option>
              <option>Vespertino</option>
              <option>Nocturno</option>
            </select>
          </div>

          <div>
            <label class="label">Estado</label>
            <select v-model="editForm.estadoMatricula" class="field">
              <option>PENDIENTE</option>
              <option>VALIDADA</option>
              <option>OBSERVADA</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="label">Dirección</label>
            <input v-model="editForm.direccion" class="field" type="text" />
          </div>

          <div class="md:col-span-2">
            <label class="label">Salud / alergias</label>
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

function mostrarResponsable(responsable) {
  if (!responsable) return "-";
  if (typeof responsable === "object") {
    return responsable.nombre || responsable.name || "-";
  }
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
.field {
  width: 100%;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 1.25rem;
  padding: 1rem 1.25rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
}

.field:focus {
  border-color: #002855;
  box-shadow: 0 0 0 3px rgba(0, 40, 85, 0.08);
}

.label {
  display: block;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  font-style: italic;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.th {
  text-align: left;
  padding: 1rem;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  font-weight: 900;
}

.td {
  padding: 1rem;
  color: #0f172a;
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
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

.mini-btn {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.mini-btn-view {
  background: #e0f2fe;
  color: #075985;
}

.mini-btn-edit {
  background: #ede9fe;
  color: #5b21b6;
}

.mini-btn-delete {
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
  max-width: 850px;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}

.modal-wide {
  max-width: 1000px;
}

.modal-header {
  background: #002855;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 900;
  font-style: italic;
  text-transform: uppercase;
}

.modal-sub {
  margin-top: 0.25rem;
  color: #facc15;
  font-weight: 900;
}

.close-btn {
  border: none;
  background: rgba(255,255,255,0.12);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
}

.modal-body {
  padding: 2rem;
  background: #f8fafc;
}

.modal-footer {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  justify-content: end;
  gap: 1rem;
  background: #f8fafc;
}

.info-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-label {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #94a3b8;
}

.info-value {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.secondary-btn,
.primary-btn {
  border: none;
  border-radius: 1rem;
  padding: 0.9rem 1.4rem;
  font-weight: 900;
  cursor: pointer;
}

.secondary-btn {
  background: #e2e8f0;
  color: #0f172a;
}

.primary-btn {
  background: #002855;
  color: white;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>