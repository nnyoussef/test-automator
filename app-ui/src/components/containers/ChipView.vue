<script setup lang="ts">
import type { ChipViewProps } from '@/components/containers/index.ts';

withDefaults(defineProps<ChipViewProps>(), {
    textColor: 'var(--primary-color)',
});
</script>

<template>
    <div :title="text" class="chip" :style="{ '--color': textColor }">
        {{ text }}
    </div>
</template>

<style scoped>
.chip {
    --color: none;
    display: inline-flex;
    padding: 0.5rem 1rem;
    font-size: 0.7rem;
    border: 1px solid var(--color);
    border-radius: 16px;
    color: var(--color);
    width: 100px;
    background-color: var(--secondary-color);
    margin: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    place-content: center;
}
</style>
