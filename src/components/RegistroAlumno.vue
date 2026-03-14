<template>
  <div class="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
    <div class="mb-6">
      <h3 class="text-[#002855] font-black text-lg tracking-tighter uppercase">Registro Multimateria</h3>
      <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sistema de Gestión Académica El Salvador</p>
    </div>

    <form @submit.prevent="guardarUsuario" class="space-y-4">
      <div>
        <label class="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Nombre Completo (según DUI/NIE)</label>
        <input v-model="form.nombre" type="text" required class="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-700">
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">NIE / Carnet</label>
          <input v-model="form.id" type="text" required class="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700">
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Tipo de Usuario</label>
          <select v-model="form.rol" class="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700">
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="DOCENTE">Docente</option>
          </select>
        </div>
      </div>

      <div v-if="form.rol === 'DOCENTE'" class="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 animate-slide-up">
        <label class="block text-[10px] font-black text-blue-600 uppercase mb-2 ml-1">Asignatura a Cargo</label>
        <select v-model="form.materia" class="w-full p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-blue-900 shadow-sm">
          <option value="Matemática">Matemática</option>
          <option value="Lengua">Lengua</option>
          <option value="Ciencia y Tecnología">Ciencia y Tecnología</option>
          <option value="Estudios Sociales">Estudios Sociales</option>
          <option value="Inglés">Inglés</option>
          <option value="Informática">Informática</option>
          <option value="Moral, Urbanidad y Cívica">Moral, Urbanidad y Cívica</option>
          <option value="Educación Física">Educación Física</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Grado y Sección</label>
        <select v-model="form.grado" class="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700 cursor-pointer">
          <optgroup label="Educación Media">
            <option value="1er Año - Sección A">1er Año - Sección A</option>
            <option value="1er Año - Sección B">1er Año - Sección B</option>
            <option value="1er Año - Sección C">1er Año - Sección C</option>
            <option value="2do Año - Sección A">2do Año - Sección A</option>
            <option value="2do Año - Sección B">2do Año - Sección B</option>
            <option value="2do Año - Sección C">2do Año - Sección C</option>
          </optgroup>
          <optgroup label="Administración">
            <option value="Personal Administrativo">Personal Administrativo</option>
          </optgroup>
        </select>
      </div>

      <button type="submit" :disabled="enviando" class="w-full bg-[#002855] text-white font-black py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2">
        <span>{{ enviando ? 'PROCESANDO...' : '💾 GUARDAR REGISTRO' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const form = ref({ 
  nombre: '', 
  id: '', 
  grado: '1er Año - Sección A', 
  rol: 'ESTUDIANTE',
  materia: 'Matemática' 
});
const enviando = ref(false);

const guardarUsuario = async () => {
  enviando.value = true;
  try {
    const res = await fetch('/api/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    if (res.ok) {
      alert("✅ Registro exitoso en la base de datos.");
      window.location.reload();
    }
  } catch (e) { alert("❌ Error de conexión"); }
  finally { enviando.value = false; }
};
</script>