<template>
  <div class="w-full">
    <div class="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
      <div class="bg-[#002855] px-10 py-8 border-b-[8px] border-[#fbbf24]">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 class="text-white text-4xl font-black italic tracking-tight uppercase">
              Inscripción CPEG
            </h2>
            <p class="text-yellow-400 text-sm font-black italic uppercase mt-2 tracking-wide">
              Complejo Educativo Profa. Eva Garcilazo de Polanco
            </p>
          </div>

          <div class="bg-white/10 border border-white/20 rounded-[2rem] px-8 py-5 min-w-[220px]">
            <p class="text-white/70 text-[10px] uppercase font-black italic">ID Asignado:</p>
            <p class="text-yellow-400 text-2xl font-black italic mt-1">
              {{ codigoGenerado || "Se asignará al registrar" }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="guardarMatricula" class="bg-[#f8fafc]">
        <div class="px-10 py-10 space-y-12">
          <section>
            <div class="flex items-center gap-3 mb-6">
              <span class="w-7 h-7 rounded-xl bg-[#002855] text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <h3 class="text-[#002855] text-lg font-black italic uppercase">
                Ubicación académica
              </h3>
            </div>

            <div class="border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="label">Año de bachillerato</label>
                <select v-model="form.grado" class="field">
                  <option>1er Año</option>
                  <option>2do Año</option>
                  <option>3er Año</option>
                </select>
              </div>

              <div>
                <label class="label">Sección asignada</label>
                <select v-model="form.seccion" class="field field-active">
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </div>

              <div>
                <label class="label">Turno / jornada</label>
                <select v-model="form.turno" class="field">
                  <option>Matutino</option>
                  <option>Vespertino</option>
                  <option>Nocturno</option>
                </select>
              </div>

              <div>
                <label class="label">Modalidad</label>
                <select v-model="form.materia" class="field">
                  <option>General</option>
                  <option>Técnico</option>
                  <option>Académico</option>
                </select>
              </div>

              <div>
                <label class="label">ID docente asignado</label>
                <input
                  v-model="form.docenteId"
                  type="text"
                  class="field"
                  placeholder="Ej: 1001"
                />
              </div>

              <div>
                <label class="label">Docente asignado</label>
                <input
                  v-model="form.docenteAsignado"
                  type="text"
                  class="field"
                  placeholder="Ej: Juan Polanco"
                />
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center gap-3 mb-6">
              <span class="w-7 h-7 rounded-xl bg-[#002855] text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <h3 class="text-[#002855] text-lg font-black italic uppercase">
                Datos del estudiante
              </h3>
            </div>

            <div class="border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="label">Nombres</label>
                <input v-model="form.nombres" type="text" class="field" placeholder="Nombres del estudiante" />
              </div>

              <div>
                <label class="label">Apellidos</label>
                <input v-model="form.apellidos" type="text" class="field" placeholder="Apellidos del estudiante" />
              </div>

              <div>
                <label class="label">NIE</label>
                <input v-model="form.nie" type="text" class="field" placeholder="0000000" />
              </div>

              <div>
                <label class="label">Fecha de nacimiento</label>
                <input v-model="form.fechaNacimiento" type="date" class="field" />
              </div>

              <div>
                <label class="label">Sexo</label>
                <select v-model="form.sexo" class="field">
                  <option>Masculino</option>
                  <option>Femenino</option>
                </select>
              </div>

              <div>
                <label class="label">Teléfono del estudiante</label>
                <input v-model="form.telefonoEstudiante" type="text" class="field" placeholder="0000-0000" />
              </div>

              <div class="md:col-span-2">
                <label class="label">Dirección exacta de residencia</label>
                <input v-model="form.direccion" type="text" class="field" placeholder="Cantón, colonia, calle, municipio y departamento" />
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center gap-3 mb-6">
              <span class="w-7 h-7 rounded-xl bg-[#002855] text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <h3 class="text-[#002855] text-lg font-black italic uppercase">
                Datos del responsable
              </h3>
            </div>

            <div class="border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="label">Nombre completo del responsable</label>
                <input v-model="form.responsable" type="text" class="field" placeholder="Nombre del responsable" />
              </div>

              <div>
                <label class="label">Parentesco</label>
                <select v-model="form.parentesco" class="field">
                  <option>Madre</option>
                  <option>Padre</option>
                  <option>Abuela</option>
                  <option>Abuelo</option>
                  <option>Tía</option>
                  <option>Tío</option>
                  <option>Encargado legal</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label class="label">DUI del responsable</label>
                <input v-model="form.duiResponsable" type="text" class="field" placeholder="00000000-0" />
              </div>

              <div>
                <label class="label">Teléfono principal</label>
                <input v-model="form.telefonoResponsable" type="text" class="field" placeholder="0000-0000" />
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center gap-3 mb-6">
              <span class="w-7 h-7 rounded-xl bg-[#eab308] text-white text-xs font-black flex items-center justify-center">
                4
              </span>
              <h3 class="text-[#b45309] text-lg font-black italic uppercase">
                Salud y observaciones
              </h3>
            </div>

            <div class="border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="label">Alergias o enfermedades</label>
                <input v-model="form.salud" type="text" class="field" placeholder="Ninguna" />
              </div>

              <div>
                <label class="label">Medicamento permanente</label>
                <input v-model="form.medicamento" type="text" class="field" placeholder="Ninguno" />
              </div>

              <div class="md:col-span-2">
                <label class="label">Observaciones médicas</label>
                <textarea v-model="form.observacionesMedicas" class="field min-h-[120px]" placeholder="Observaciones importantes para casos de emergencia"></textarea>
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center gap-3 mb-6">
              <span class="w-7 h-7 rounded-xl bg-[#eab308] text-white text-xs font-black flex items-center justify-center">
                5
              </span>
              <h3 class="text-[#b45309] text-lg font-black italic uppercase">
                Documentos entregados
              </h3>
            </div>

            <div class="border-t border-slate-200 pt-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="doc-check">
                  <input v-model="form.docs.partidaNacimiento" type="checkbox" />
                  <span>Partida de nacimiento</span>
                </label>

                <label class="doc-check">
                  <input v-model="form.docs.certificadoNotas" type="checkbox" />
                  <span>Certificado / constancia de notas</span>
                </label>

                <label class="doc-check">
                  <input v-model="form.docs.duiResponsable" type="checkbox" />
                  <span>Copia de DUI del responsable</span>
                </label>

                <label class="doc-check">
                  <input v-model="form.docs.nie" type="checkbox" />
                  <span>NIE / documento del estudiante</span>
                </label>
              </div>

              <div class="file-upload">
                <label class="file-label">
                  <input type="file" @change="handleFileChange" hidden />

                  <div :class="['file-content', form.archivoNombre ? 'has-file' : '']">
                    <div class="file-icon">
                      {{ form.archivoNombre ? "✅" : "📎" }}
                    </div>

                    <div class="file-text">
                      <p class="file-title">
                        {{ form.archivoNombre || "Seleccionar archivo" }}
                      </p>
                      <p class="file-sub">
                        {{
                          form.archivoNombre
                            ? "Archivo cargado correctamente"
                            : "PDF, imágenes o documentos académicos"
                        }}
                      </p>
                    </div>

                    <div class="file-button">
                      {{ form.archivoNombre ? "Cambiar" : "Subir" }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section>
            <div class="flex items-center gap-3 mb-6">
              <span class="w-7 h-7 rounded-xl bg-[#002855] text-white text-xs font-black flex items-center justify-center">
                6
              </span>
              <h3 class="text-[#002855] text-lg font-black italic uppercase">
                Validación de matrícula
              </h3>
            </div>

            <div class="border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label class="label">Estado</label>
                <select v-model="form.estadoMatricula" class="field">
                  <option>PENDIENTE</option>
                  <option>VALIDADA</option>
                  <option>OBSERVADA</option>
                </select>
              </div>

              <div>
                <label class="label">Fecha de matrícula</label>
                <input v-model="form.fechaMatricula" type="date" class="field" />
              </div>
            </div>
          </section>
        </div>

        <div class="bg-slate-100 border-t border-slate-200 px-10 py-10">
          <div v-if="error" class="mb-5 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 font-semibold">
            {{ error }}
          </div>

          <div v-if="success" class="mb-5 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-700 font-semibold">
            {{ success }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="mx-auto block w-full max-w-3xl bg-[#002855] hover:bg-[#001d3d] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-[2rem] py-6 font-black italic uppercase tracking-[0.2em] shadow-xl text-lg"
          >
            {{ loading ? "GUARDANDO..." : "🚀 FINALIZAR MATRÍCULA" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const loading = ref(false);
const error = ref("");
const success = ref("");
const codigoGenerado = ref("");

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function crearEstadoInicial() {
  return {
    grado: "1er Año",
    seccion: "A",
    turno: "Matutino",
    materia: "General",
    docenteId: "",
    docenteAsignado: "",

    nombres: "",
    apellidos: "",
    nie: "",
    fechaNacimiento: "",
    sexo: "Masculino",
    telefonoEstudiante: "",
    direccion: "",

    responsable: "",
    parentesco: "Madre",
    duiResponsable: "",
    telefonoResponsable: "",

    salud: "Ninguna",
    medicamento: "Ninguno",
    observacionesMedicas: "",

    docs: {
      partidaNacimiento: false,
      certificadoNotas: false,
      duiResponsable: false,
      nie: false,
    },

    archivoNombre: "",
    estadoMatricula: "PENDIENTE",
    fechaMatricula: hoy(),
  };
}

const form = reactive(crearEstadoInicial());

function resetFormulario() {
  Object.assign(form, crearEstadoInicial());
}

function handleFileChange(event) {
  const file = event.target.files?.[0];
  form.archivoNombre = file ? file.name : "";
}

function validarFormulario() {
  if (!form.nombres.trim()) return "Debes ingresar los nombres del estudiante.";
  if (!form.apellidos.trim()) return "Debes ingresar los apellidos del estudiante.";
  if (!form.nie.trim()) return "Debes ingresar el NIE.";
  if (!form.direccion.trim()) return "Debes ingresar la dirección.";
  if (!form.responsable.trim()) return "Debes ingresar el nombre del responsable.";
  if (!form.telefonoResponsable.trim()) return "Debes ingresar el teléfono del responsable.";
  if (!form.docenteId.trim()) return "Debes ingresar el ID del docente asignado.";
  if (!form.docenteAsignado.trim()) return "Debes ingresar el nombre del docente asignado.";
  return "";
}

async function guardarMatricula() {
  error.value = "";
  success.value = "";

  const errorValidacion = validarFormulario();
  if (errorValidacion) {
    error.value = errorValidacion;
    return;
  }

  loading.value = true;

  try {
    const payload = {
      nombre: `${form.nombres} ${form.apellidos}`.trim(),
      nombres: form.nombres,
      apellidos: form.apellidos,
      nie: form.nie,
      direccion: form.direccion,
      rol: "ALUMNO",
      salud: form.salud,
      responsable: form.responsable,
      grado: form.grado,
      seccion: form.seccion,
      materia: form.materia,
      turno: form.turno,
      docenteId: form.docenteId,
      docenteAsignado: form.docenteAsignado,
      fechaNacimiento: form.fechaNacimiento,
      sexo: form.sexo,
      telefonoEstudiante: form.telefonoEstudiante,
      parentesco: form.parentesco,
      duiResponsable: form.duiResponsable,
      telefonoResponsable: form.telefonoResponsable,
      medicamento: form.medicamento,
      observacionesMedicas: form.observacionesMedicas,
      documentos: form.docs,
      archivoNombre: form.archivoNombre,
      estadoMatricula: form.estadoMatricula,
      fechaMatricula: form.fechaMatricula,
    };

    const res = await fetch("/api/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo guardar la matrícula.");
    }

    const codigoReal = data?.item?.PK || "";
    codigoGenerado.value = codigoReal;

    success.value = codigoReal
      ? `Matrícula guardada correctamente. Código asignado: ${codigoReal}`
      : "Matrícula guardada correctamente.";

    resetFormulario();
  } catch (err) {
    error.value = err.message || "Ocurrió un error inesperado.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.label {
  display: block;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  font-style: italic;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.field {
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  border-radius: 1.25rem;
  padding: 1rem 1.25rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.field:focus {
  border-color: #002855;
  box-shadow: 0 0 0 3px rgba(0, 40, 85, 0.08);
}

.field-active {
  border-color: #002855;
  background: #f8fafc;
}

.doc-check {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1rem 1.25rem;
  font-weight: 800;
  color: #334155;
}

.file-upload {
  width: 100%;
}

.file-label {
  display: block;
  cursor: pointer;
}

.file-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 2px dashed #cbd5f5;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.25s ease;
}

.file-content:hover {
  border-color: #002855;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 40, 85, 0.08);
}

.file-content.has-file {
  border-color: #16a34a;
  background: linear-gradient(to bottom, #f0fdf4, #dcfce7);
}

.file-icon {
  font-size: 1.8rem;
}

.file-text {
  flex: 1;
}

.file-title {
  font-weight: 900;
  color: #002855;
  font-size: 0.95rem;
}

.file-sub {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 700;
}

.file-button {
  background: #002855;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>