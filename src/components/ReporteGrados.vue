<template>
  <div class="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
    <h3 class="text-slate-800 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
      <span class="p-2 bg-yellow-100 rounded-lg text-yellow-600">📊</span>
      Distribución por Grado Académico
    </h3>

    <div class="space-y-6">
      <div v-for="(cantidad, grado) in estadisticas" :key="grado">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold text-slate-600 uppercase">{{ grado }}</span>
          <span class="text-xs font-black text-blue-700">{{ cantidad }} Alumnos</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            class="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-1000 ease-out"
            :style="{ width: (cantidad / totalAlumnos * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400">
      <span>CÁLCULO EN TIEMPO REAL</span>
      <span>TOTAL GENERAL: {{ totalAlumnos }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const estadisticas = ref({});

const obtenerStats = async () => {
  const res = await fetch('/api/stats');
  estadisticas.value = await res.json();
};

const totalAlumnos = computed(() => {
  return Object.values(estadisticas.value).reduce((a, b) => a + b, 0);
});

onMounted(obtenerStats);
</script>