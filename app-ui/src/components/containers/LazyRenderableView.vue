<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import type { LazyRendererableProps } from '@/components/containers/index.ts';

const props = withDefaults(defineProps<LazyRendererableProps>(), {
    render: false,
});

let AsyncComponent: unknown;
const _render = ref(false);
if (props.asyncRenderFunction) {
    AsyncComponent = defineAsyncComponent(props.asyncRenderFunction);
}

watch(
    () => props.render,
    () => {
        requestAnimationFrame(() => (_render.value = true));
    },
    {
        once: true,
    },
);
</script>

<template>
    <template v-if="_render && $slots.default">
        <slot v-memo="_render" />
    </template>
    <template v-else-if="_render">
        <AsyncComponent v-bind="asyncComponentData"></AsyncComponent>
    </template>
</template>
