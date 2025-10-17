<script setup lang="ts">
import VerticalBox from '@/components/layouts/VerticalBox.vue';

defineProps<{
    title?: string;
    data?: {};
}>();
</script>

<template>
    <VerticalBox>
        <h2 v-if="title">{{ title }}</h2>
        <ul>
            <li v-for="(value, key) in data" :key="key">
                <strong>{{ key }}:</strong>
                {{ value }}
            </li>
        </ul>
    </VerticalBox>
</template>
