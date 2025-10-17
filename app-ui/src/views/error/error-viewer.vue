<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const { err, file, info } = useRouter().currentRoute.value.meta;

let error = ref([err]);
if (err instanceof Error) {
    error.value = err.stack?.split('\n') ?? [];
}
</script>

<template>
    <h1>{{ file }} ({{ info }})</h1>

    <template v-for="(e, index) in error" :key="index">
        <h2 v-if="index === 0">{{ e }}</h2>
        <h3 v-else>{{ e }}</h3>
    </template>
</template>
<style scoped>
h3 {
    margin-left: 48px;
}
</style>
