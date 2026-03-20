<script setup>
import { ref, onMounted } from 'vue';

const clases = ref([]);
const cargando = ref(false);
const userRol = ref(''); 

const obtenerRecursos = async () => {
  try {
    const res = await fetch('/api/recursos');
    if (res.ok) clases.value = await res.json();
  } catch (e) { console.error("Error cargando aula", e); }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    userRol.value = (localStorage.getItem('user_rol') || 'ALUMNO').toUpperCase();
    obtenerRecursos();
  }
});
</script>

<template>
  <div class="w-full pb-20 italic font-sans">
    <div class="flex justify-between items-center mb-8 px-2">
       <h3 class="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Aula Virtual: Recursos y Entregas</h3>
       <span class="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-black text-[9px]">AWS S3 STORAGE</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="clase in clases" :key="clase.PK" 
           class="group bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-50 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col">
        
        <span :class="clase.tipo === 'entrega' ? 'bg-emerald-500' : 'bg-[#002855]'" 
              class="absolute right-0 top-0 text-white text-[8px] font-black px-5 py-1.5 rounded-bl-2xl uppercase shadow-md">
          {{ clase.tipo === 'entrega' ? 'Tarea Recibida' : 'Material' }}
        </span>

        <div v-if="userRol === 'DOCENTE' && clase.tipo === 'entrega'" 
             class="mb-4 flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-emerald-200 text-emerald-600 font-black text-[10px] shadow-sm">
            {{ clase.autor ? clase.autor.substring(0,2).toUpperCase() : 'ST' }}
          </div>
          <div>
            <p class="text-[7px] font-black uppercase text-emerald-500 leading-none">Alumno:</p>
            <p class="text-[10px] font-bold text-slate-800">{{ clase.autor || 'Estudiante CPEG' }}</p>
          </div>
        </div>

        <div class="aspect-video bg-slate-900 rounded-2xl mb-4 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform duration-500">
          {{ clase.tipo === 'video' ? '📺' : clase.tipo === 'entrega' ? '📤' : '📄' }}
        </div>
        
        <h4 class="font-black text-slate-800 uppercase text-[10px] mb-6 leading-tight h-8 overflow-hidden">{{ clase.titulo }}</h4>
        
        <div class="mt-auto flex flex-col gap-2">
          <a :href="clase.url" target="_blank" 
             class="block text-center bg-slate-50 hover:bg-[#002855] hover:text-white py-3 rounded-xl font-black text-[9px] uppercase border transition-all">
            {{ userRol === 'DOCENTE' && clase.tipo === 'entrega' ? '🔍 REVISAR TAREA' : 'ABRIR RECURSO' }}
          </a>
          <button v-if="userRol === 'DOCENTE' && clase.tipo === 'entrega'"
                  class="w-full bg-yellow-400 text-[#002855] py-3 rounded-xl font-black text-[9px] uppercase shadow-md border-b-4 border-yellow-600 active:border-b-0 transition-all">
            📝 ASIGNAR CALIFICACIÓN
          </button>
        </div>
      </div>
    </div>
  </div>
</template>