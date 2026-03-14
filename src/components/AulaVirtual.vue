<script setup>
import { ref, onMounted } from 'vue';

const clases = ref([]);
const cargando = ref(false);
const userRol = ref(''); // Empezamos vacío

// Variables de formulario
const metodo = ref('s3'); 
const archivo = ref(null);
const nuevo = ref({ titulo: '', url: '', tipo: 'pdf' });

const seleccionarArchivo = (e) => { archivo.value = e.target.files[0]; };

const obtenerRecursos = async () => {
  try {
    const res = await fetch('/api/recursos');
    if (res.ok) {
      const datos = await res.json();
      clases.value = datos;
    }
  } catch (e) { console.error("Error al obtener recursos:", e); }
};

const publicar = async () => {
  if (!nuevo.value.titulo) return alert("Pon un título");
  cargando.value = true;
  let finalUrl = nuevo.value.url;
  try {
    if (metodo.value === 's3') {
      if (!archivo.value) throw new Error("Selecciona un archivo");
      const fd = new FormData();
      fd.append("archivo", archivo.value);
      const resUp = await fetch('/api/upload', { method: 'POST', body: fd });
      const dataUp = await resUp.json();
      if (!resUp.ok) throw new Error(dataUp.error);
      finalUrl = dataUp.url;
    }
    await fetch('/api/recursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: nuevo.value.titulo,
        url: finalUrl,
        tipo: nuevo.value.tipo,
        materia: localStorage.getItem('user_materia') || 'General',
        autor: localStorage.getItem('user_name') || 'Docente'
      })
    });
    alert("✅ Publicado con éxito");
    obtenerRecursos();
  } catch (e) { alert(e.message); }
  finally { cargando.value = false; }
};

const entregarTarea = async () => {
  if (!archivo.value) return alert("Selecciona el archivo de tu tarea");
  cargando.value = true;
  try {
    const fd = new FormData();
    fd.append("archivo", archivo.value);
    const resUp = await fetch('/api/upload', { method: 'POST', body: fd });
    const dataUp = await resUp.json();
    if (!resUp.ok) throw new Error(dataUp.error);
    await fetch('/api/recursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: `ENTREGA: ${archivo.value.name}`,
        url: dataUp.url,
        tipo: 'entrega', 
        materia: localStorage.getItem('user_materia') || 'General',
        autor: localStorage.getItem('user_name') || 'Estudiante'
      })
    });
    alert("✅ Tarea enviada a S3");
    archivo.value = null; 
    obtenerRecursos(); 
  } catch (e) { alert(e.message); }
  finally { cargando.value = false; }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    // IMPORTANTE: Forzamos la lectura del rol
    const rolGuardado = localStorage.getItem('user_rol');
    console.log("Rol detectado:", rolGuardado); // Esto saldrá en la consola (F12)
    userRol.value = rolGuardado || 'ALUMNO'; 
    obtenerRecursos();
  }
});
</script>

<template>
  <div class="max-w-6xl mx-auto mt-6 pb-20 px-4">
    
    <div v-if="userRol === 'DOCENTE'" class="bg-white p-8 rounded-[2rem] shadow-xl mb-10 border-b-4 border-blue-600">
      <h3 class="text-[#002855] font-black mb-6 uppercase">👨‍🏫 Panel del Docente</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <input v-model="nuevo.titulo" placeholder="Título" class="p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100">
        <select v-model="metodo" class="p-4 bg-blue-50 text-blue-800 rounded-2xl font-bold">
            <option value="s3">📁 Subir Archivo (S3)</option>
            <option value="link">🔗 Pegar Enlace</option>
        </select>
        <div class="flex items-center">
          <input v-if="metodo === 's3'" type="file" @change="seleccionarArchivo" class="text-xs">
          <input v-else v-model="nuevo.url" placeholder="https://..." class="w-full p-4 bg-slate-50 rounded-2xl">
        </div>
      </div>
      <button @click="publicar" :disabled="cargando" class="w-full mt-6 bg-[#002855] text-white py-4 rounded-2xl font-black uppercase">
        {{ cargando ? 'PROCESANDO...' : 'PUBLICAR MATERIAL' }}
      </button>
    </div>

    <div v-if="userRol === 'ALUMNO' || userRol === 'ESTUDIANTE'" class="bg-emerald-50 p-8 rounded-[2rem] shadow-lg border-2 border-dashed border-emerald-200 mb-10">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white font-bold">UP</div>
        <div>
          <h3 class="text-emerald-900 font-black text-lg uppercase italic">Subir Tarea Concluida</h3>
          <p class="text-emerald-600 text-[10px] font-bold uppercase mt-1">Carga directa a Amazon S3</p>
        </div>
      </div>
      <div class="flex flex-col md:flex-row gap-4">
        <input type="file" @change="seleccionarArchivo" class="flex-1 p-4 bg-white rounded-2xl font-bold text-xs border border-emerald-100">
        <button @click="entregarTarea" :disabled="cargando" class="bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-md">
          {{ cargando ? 'ENVIANDO...' : 'ENTREGAR TAREA' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
      <div v-for="clase in clases" :key="clase.PK" class="bg-white rounded-[2rem] p-6 shadow-md border hover:shadow-xl transition-all relative">
        <span v-if="clase.tipo === 'entrega'" class="absolute -right-2 top-4 bg-emerald-500 text-white text-[8px] font-black px-4 py-1 rounded-l-full uppercase">Entrega Realizada</span>
        <div class="aspect-video bg-slate-900 rounded-2xl mb-4 flex items-center justify-center text-5xl">
          {{ clase.tipo === 'video' ? '📺' : clase.tipo === 'entrega' ? '📤' : '📄' }}
        </div>
        <h4 class="font-black text-slate-800 uppercase text-[11px] mb-4">{{ clase.titulo }}</h4>
        <a :href="clase.url" target="_blank" class="block text-center bg-slate-50 hover:bg-[#002855] hover:text-white py-3 rounded-xl font-black text-[10px] uppercase border border-slate-100 transition-all">
          Abrir Recurso
        </a>
      </div>
    </div>
  </div>
</template>