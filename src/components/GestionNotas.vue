<template>
  <div class="max-w-5xl mx-auto mt-10 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-slide-up">
    <div class="bg-[#002855] p-6 text-white flex justify-between items-center">
      <div>
        <h3 class="font-black text-sm uppercase tracking-widest">📋 Registro de Calificaciones</h3>
        <p class="text-blue-200 text-[10px] font-bold uppercase mt-1">Materia: {{ materiaMaestro }}</p>
      </div>
      <span class="text-[10px] bg-yellow-500 text-blue-900 px-3 py-1 rounded-full font-bold tracking-tighter">PERFIL: {{ materiaMaestro }}</span>
    </div>

    <table class="w-full text-left">
      <thead>
        <tr class="bg-slate-50 border-b border-slate-100">
          <th class="p-4 text-[10px] font-black text-slate-400 uppercase">Estudiante</th>
          <th class="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Nota Actual</th>
          <th class="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alumno in alumnos" :key="alumno.PK" class="border-b border-slate-50 hover:bg-slate-50/50">
          <td class="p-4">
            <div class="text-sm font-bold text-slate-700">{{ alumno.nombre }}</div>
            <div class="text-[9px] text-slate-400 font-bold uppercase">{{ alumno.grado }}</div>
          </td>
          <td class="p-4 text-center">
            <input 
              v-model="alumno[materiaMaestro]" 
              type="number" step="0.1" min="0" max="10"
              class="w-24 p-2 bg-white border-2 border-slate-100 rounded-lg text-center font-black text-blue-700 focus:border-yellow-500 outline-none transition-all"
            >
          </td>
          <td class="p-4 text-center">
            <button 
              @click="guardarNota(alumno.PK, alumno[materiaMaestro])"
              class="bg-blue-900 text-white hover:bg-blue-800 px-6 py-2 rounded-xl text-[10px] font-black shadow-md transition-all active:scale-95"
            >
              GUARDAR NOTA
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const alumnos = ref([]);
const materiaMaestro = ref('');

onMounted(async () => {
  // Leemos el rol y la materia del maestro
  const rol = localStorage.getItem('user_rol');
  const materia = localStorage.getItem('user_materia');
  materiaMaestro.value = materia || 'General';

  // Si es maestro, cargamos la lista
  if (rol === 'DOCENTE') {
    const res = await fetch('/api/listar');
    alumnos.value = await res.json();
  }
});

const guardarNota = async (pk, nota) => {
  try {
    const res = await fetch('/api/notas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        pk, 
        nota: parseFloat(nota), 
        materia: materiaMaestro.value 
      })
    });
    if (res.ok) alert(`Nota de ${materiaMaestro.value} sincronizada con AWS`);
  } catch (e) {
    alert("Error de conexión");
  }
};
</script>