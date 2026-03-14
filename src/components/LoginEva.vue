<template>
  <div class="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-fade-in">
    <form @submit.prevent="manejarLogin" class="space-y-6">
      <div>
        <label class="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">Identificación de Usuario</label>
        <input 
          v-model="id" 
          type="text" 
          required
          class="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#002855] focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-inner"
          placeholder="Ej: 2026010"
        >
      </div>

      <button 
        type="submit" 
        :disabled="cargando"
        class="w-full bg-[#002855] text-white font-black py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all transform active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-3"
      >
        <span v-if="cargando" class="animate-spin text-xl">🔄</span>
        <span>{{ cargando ? 'VERIFICANDO...' : 'ENTRAR AL PANEL' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const id = ref('');
const cargando = ref(false);

const manejarLogin = async () => {
  if (!id.value) return;
  cargando.value = true;
  
  try {
    const res = await fetch(`/api/login?id=${id.value}`);
    const datos = await res.json();

    if (res.ok) {
      // GUARDAMOS TODO LO NECESARIO EN EL NAVEGADOR
      localStorage.setItem('user_rol', datos.rol || 'ESTUDIANTE');
      localStorage.setItem('user_name', datos.nombre);
      localStorage.setItem('user_grado', datos.grado);
      
      // NOTA: Guardamos la materia para que el sistema sepa qué califica este maestro
      localStorage.setItem('user_materia', datos.materia || '');
      
      window.location.href = '/';
    } else {
      alert("⚠️ AWS dice: " + (datos.error || "ID no encontrado"));
    }
  } catch (e) {
    alert("❌ Error de conexión");
  } finally {
    cargando.value = false;
  }
};
</script>