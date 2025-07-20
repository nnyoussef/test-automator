<script setup lang="ts">
import { ref, watch } from 'vue';
import IconContainer from '@/components/icons/IconContainer.vue';

const props = defineProps({ isDown: { type: Boolean, required: true } });
const arrowRotationStyle = ref({ transform: 'rotate(0deg)' });

watch(
    () => props.isDown,
    (value: boolean) => {
        requestAnimationFrame(() => {
            if (value) {
                arrowRotationStyle.value = { transform: 'rotate(0deg)' };
            } else {
                arrowRotationStyle.value = { transform: 'rotate(-180deg)' };
            }
        });
    },
);
</script>

<template>
    <IconContainer
        style="transition: transform 200ms linear; cursor: pointer"
        :style="arrowRotationStyle"
        icon="arrow"
        size="24px"
        fill="#5f6368"
    />
</template>
