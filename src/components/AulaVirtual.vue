<script setup>
import { ref, onMounted } from 'vue';

const clases = ref([]);
const cargando = ref(false);
const userRol = ref(''); // <--- Lo dejamos vacío al inicio

// Variables para el formulario
const metodo = ref('s3');
const archivo = ref(null);
const nuevo = ref({ titulo: '', url: '', tipo: 'pdf' });

const seleccionarArchivo = (e) => { archivo.value = e.target.files[0]; };

const obtenerRecursos = async () => {
  const res = await fetch('/api/recursos');
  if (res.ok) clases.value = await res.json();
};

const publicar = async () => {
  // ... (tu lógica de publicar queda igual)
};

// ESTO ES LO QUE ARREGLA EL ERROR:
onMounted(() => {
  // Solo se ejecuta cuando ya estamos en el navegador
  if (typeof window !== 'undefined') {
    userRol.value = localStorage.getItem('user_rol') || '';
    obtenerRecursos();
  }
});
</script>

<template>
  <div class="max-w-6xl mx-auto mt-6 pb-20">
    <div v-if="userRol === 'DOCENTE'" class="bg-white p-8 rounded-3xl shadow-xl mb-10 border-b-4 border-blue-600">
      <h3 class="text-[#002855] font-black mb-6 uppercase italic">Nueva Publicación</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <input v-model="nuevo.titulo" placeholder="Título del recurso" class="p-4 bg-slate-50 rounded-2xl font-bold">
        
        <select v-model="metodo" class="p-4 bg-blue-50 text-blue-800 rounded-2xl font-bold">
          <option value="s3">📁 Subir desde mi PC (S3)</option>
          <option value="link">🔗 Pegar Enlace (Drive/YT)</option>
        </select>

        <div class="flex items-center">
          <input v-if="metodo === 's3'" type="file" @change="seleccionarArchivo" class="text-xs">
          <input v-else v-model="nuevo.url" placeholder="https://..." class="w-full p-4 bg-slate-50 rounded-2xl font-bold">
        </div>
      </div>

      <button @click="publicar" :disabled="cargando" class="w-full mt-6 bg-[#002855] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-900 transition-all">
        {{ cargando ? '🚀 PROCESANDO EN AWS...' : 'PUBLICAR AHORA' }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="clase in clases" :key="clase.PK" class="bg-white rounded-[2rem] p-6 shadow-md border hover:shadow-xl transition-all">
        <div class="aspect-video bg-slate-900 rounded-2xl mb-4 flex items-center justify-center text-5xl">
          {{ clase.tipo === 'video' ? '📺' : '📄' }}
        </div>
        <h4 class="font-black text-slate-800 uppercase text-xs mb-4">{{ clase.titulo }}</h4>
        <a :href="clase.url" target="_blank" class="block text-center bg-slate-100 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-black text-[10px] uppercase transition-colors">
          Abrir Recurso
        </a>
      </div>
    </div>
  </div>
</template>