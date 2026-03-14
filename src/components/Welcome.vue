<template>
  <div class="p-6 bg-blue-50 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-blue-900">
      Bienvenido a Plataforma Eva
    </h1>
    <p class="mt-2 text-gray-700">
      Hola, {{ nombreUsuario }}. Tienes tareas pendientes por revisar.
    </p>
    <button 
      @click="verNotas"
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Ver mis calificaciones
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const nombreUsuario = ref('Estudiante');

const verNotas = () => {
  alert('Redirigiendo al módulo de notas...');
};
</script>