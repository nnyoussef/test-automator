<script setup lang="ts">
import VerticalLayout from '@/components/layouts/VerticalLayout.vue';
import type { TooltipViewProps } from '@/components/containers/index.ts';

defineProps<TooltipViewProps>();
</script>

<template>
    <Transition name="fade">
        <VerticalLayout
            :centered-items="true"
            v-if="tooltipShow"
            :style="{ positionAnchor: anchorName }"
            class="tooltip"
        >
            <slot />
        </VerticalLayout>
    </Transition>
</template>

<style scoped>
.tooltip {
    position: fixed;
    top: anchor(bottom);
    justify-self: anchor-center;
    margin-top: 0;
    max-width: 100px;
    background: var(--neutral-color);
    border-radius: 5px;
    white-space: normal;
    overflow-wrap: anywhere;
    padding: 1rem;
    border: 1px solid var(--neutral-accent-color);
    box-shadow: var(--box-shadow);
}
</style>
