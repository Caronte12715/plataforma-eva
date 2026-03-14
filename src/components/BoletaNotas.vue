<template>
  <div class="max-w-4xl mx-auto mt-8 animate-fade-in">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-3xl text-white shadow-xl flex flex-col items-center">
        <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Promedio Global</span>
        <h2 class="text-4xl font-black mt-2">{{ promedioGlobal }}</h2>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materias Evaluadas</span>
        <h2 class="text-3xl font-black text-slate-800 mt-2">{{ totalMaterias }}</h2>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Final</span>
        <h2 class="text-xl font-black mt-2" :class="promedioGlobal >= 6 ? 'text-green-600' : 'text-red-600'">
          {{ promedioGlobal >= 6 ? 'PROMOVIDO' : 'EN RIESGO' }}
        </h2>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(nota, materia) in materiasFiltradas" :key="materia" class="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase">{{ materia }}</p>
            <p class="text-sm font-bold text-slate-700">Unidad 1</p>
          </div>
          <div class="text-xl font-black text-blue-700">{{ nota.toFixed(1) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const misDatos = ref({});

const obtenerMisNotas = async () => {
  const id = localStorage.getItem('user_id');
  const res = await fetch(`/api/login?id=${id}`);
  if (res.ok) misDatos.value = await res.json();
};

const materiasFiltradas = computed(() => {
  const excluidos = ['PK', 'SK', 'nombre', 'grado', 'rol', 'fechaRegistro', 'materia'];
  const notas = {};
  for (const key in misDatos.value) {
    if (!excluidos.includes(key) && typeof misDatos.value[key] === 'number') {
      notas[key] = misDatos.value[key];
    }
  }
  return notas;
});

const totalMaterias = computed(() => Object.keys(materiasFiltradas.value).length);

const promedioGlobal = computed(() => {
  const notas = Object.values(materiasFiltradas.value);
  if (notas.length === 0) return "0.0";
  const suma = notas.reduce((a, b) => a + b, 0);
  return (suma / notas.length).toFixed(1);
});

onMounted(obtenerMisNotas);
</script>