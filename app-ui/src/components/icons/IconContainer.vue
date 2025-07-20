<script setup lang="ts">
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import type { IconContainerProps } from '.';
import { computed } from 'vue';
import SvgSprite from '@/assets/icon-interactive.svg';

const props = withDefaults(defineProps<IconContainerProps>(), {
    fill: '',
    size: '24px',
    className: '',
    label: '',
});
const iconHref = computed(() => `${SvgSprite}#${props.icon}`);
</script>

<template>
    <HorizontalLayout :class="className" v-memo="props.icon">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            ref="iconRef"
            :height="size"
            :width="size"
            :fill="fill"
        >
            <use :href="iconHref"></use>
        </svg>
        <p :style="{ color: fill }">{{ label }}</p>
    </HorizontalLayout>
</template>
