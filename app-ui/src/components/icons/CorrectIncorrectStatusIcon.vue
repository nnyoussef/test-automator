<script setup lang="ts">
import IconContainer from '@/components/icons/IconContainer.vue';

defineProps({ isCorrect: { type: Boolean, default: false } });
</script>

<template>
    <template v-if="isCorrect">
        <IconContainer icon="tick" class-name="icon-button" fill="green" size="24px" />
    </template>
    <template v-else>
        <IconContainer
            style="cursor: pointer"
            icon="notice"
            class-name="icon-button"
            fill="var(--error-color)"
            size="24px"
        />
    </template>
</template>
