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
    <HorizontalLayout
        :class="className"
        v-memo="props.icon"
        :data-role="role"
        :data-element-value="value"
    >
        <svg
            ref="iconRef"
            :height="size"
            :width="size"
            :fill="fill"
            :data-role="role"
            :data-element-value="value"
        >
            <use :data-role="role" :data-element-value="value" :href="iconHref" />
        </svg>

        <p :data-role="role" :data-element-value="value" :style="{ color: fill }">{{ label }}</p>
    </HorizontalLayout>
</template>
