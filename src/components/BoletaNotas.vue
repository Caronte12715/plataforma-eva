<script setup>
import { ref, onMounted } from 'vue';
const notas = ref([]);
const cargando = ref(false);

const cargar = async () => {
  cargando.value = true;
  const res = await fetch('/api/recursos'); // Ajusta a tu endpoint de notas
  if (res.ok) {
    const data = await res.json();
    notas.value = data.filter(d => d.SK === 'NOTA' || d.tipo === 'nota');
  }
  cargando.value = false;
};

// Función para calcular promedio sin NaN
const calcularPromedio = (n) => {
  const p1 = parseFloat(n.p1) || 0;
  const p2 = parseFloat(n.p2) || 0;
  const p3 = parseFloat(n.p3) || 0;
  const p4 = parseFloat(n.p4) || 0;
  return ((p1 + p2 + p3 + p4) / 4).toFixed(1);
};

onMounted(cargar);
</script>

<template>
  <div class="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
    <h3 class="text-xl font-black text-[#002855] mb-6 uppercase">📊 Reporte de Calificaciones</h3>
    <table class="w-full text-left">
      <thead>
        <tr class="text-[10px] font-black uppercase text-slate-400 border-b">
          <th class="pb-4">Asignatura</th>
          <th class="pb-4 text-center">P1</th><th class="pb-4 text-center">P2</th>
          <th class="pb-4 text-center">P3</th><th class="pb-4 text-center">P4</th>
          <th class="pb-4 text-center text-blue-600">Final</th>
        </tr>
      </thead>
      <tbody class="text-sm font-bold text-slate-700">
        <tr v-for="n in notas" :key="n.PK" class="border-b border-slate-50">
          <td class="py-5">{{ n.materia || 'General' }}</td>
          <td class="text-center">{{ n.p1 || '-' }}</td>
          <td class="text-center">{{ n.p2 || '-' }}</td>
          <td class="text-center">{{ n.p3 || '-' }}</td>
          <td class="text-center">{{ n.p4 || '-' }}</td>
          <td class="text-center text-blue-700 font-black">{{ calcularPromedio(n) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>