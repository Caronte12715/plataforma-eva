<template>
  <div class="max-w-5xl mx-auto mt-12 mb-20 animate-fade-in">
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      
      <div class="bg-gradient-to-r from-[#002855] to-[#004085] p-6 flex justify-between items-center">
        <div>
          <h3 class="text-white font-black text-lg tracking-tight flex items-center gap-2">
            <span class="bg-yellow-500 w-2 h-6 rounded-full"></span>
            CONTROL ACADÉMICO
          </h3>
          <p class="text-blue-200 text-[10px] font-bold uppercase mt-1">Sincronizado con AWS Cloud</p>
        </div>
        <button @click="obtenerAlumnos" class="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-2">
          <span :class="{'animate-spin': cargando}">🔄</span> REFRESCAR
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nota U1</th>
              <th class="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
              <th class="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación</th>
              <th class="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Académico</th>
              <th class="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gestión</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="alumno in alumnos" :key="alumno.PK" class="hover:bg-blue-50/30 transition-all group">
              
              <td class="p-5 text-center font-black text-blue-600 text-lg">
                {{ alumno.notaUnidad1 || '—' }}
              </td>

              <td class="p-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {{ obtenerIniciales(alumno.nombre) }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-slate-800">{{ alumno.nombre }}</div>
                    <div class="text-[10px] text-slate-400 font-medium italic">AWS DynamoDB Record</div>
                  </div>
                </div>
              </td>

              <td class="p-5 text-xs font-mono font-bold text-slate-600">
                {{ alumno.PK.split('#')[1] }}
              </td>

              <td class="p-5">
                <span :class="claseGrado(alumno.grado)" class="text-[10px] font-black px-3 py-1.5 rounded-lg border whitespace-nowrap">
                  {{ alumno.grado }}
                </span>
              </td>

              <td class="p-5 text-center">
                <button 
                  v-if="userRol === 'DOCENTE'"
                  @click="eliminarAlumno(alumno.PK)"
                  class="p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                >
                  🗑️
                </button>
                <div v-else class="flex flex-col items-center opacity-30">
                  <span class="text-lg">🔒</span>
                  <span class="text-[8px] font-black uppercase tracking-tighter text-slate-500">Bloqueado</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const alumnos = ref([]);
const cargando = ref(false);
const userRol = ref(''); 

const obtenerAlumnos = async () => {
  cargando.value = true;
  try {
    const rol = localStorage.getItem('user_rol');
    const miGrado = localStorage.getItem('user_grado'); 
    const url = rol === 'ESTUDIANTE' ? `/api/listar?grado=${encodeURIComponent(miGrado)}` : '/api/listar';
    
    const res = await fetch(url);
    alumnos.value = await res.json();
  } catch (e) { console.error(e); }
  finally { cargando.value = false; }
};

const eliminarAlumno = async (pk) => {
  if (!confirm("¿Eliminar de AWS?")) return;
  const res = await fetch('/api/eliminar', { 
    method: 'DELETE', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({ pk }) 
  });
  if(res.ok) obtenerAlumnos();
};

const obtenerIniciales = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : '??';

const claseGrado = (g) => g?.includes('1er') ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100';

onMounted(() => {
  userRol.value = localStorage.getItem('user_rol');
  obtenerAlumnos();
});
</script>