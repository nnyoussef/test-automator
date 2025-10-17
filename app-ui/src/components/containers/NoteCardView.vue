<script setup lang="ts">
import type { NoteCardViewProps } from '@/components/containers/index.ts';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import { computed } from 'vue';
import IconContainer from '@/components/icons/IconContainer.vue';

const props = withDefaults(defineProps<NoteCardViewProps>(), {
    type: 'info',
});
const icon = computed(() => props.type);
</script>

<template>
    <HorizontalLayout class="notecard" :class="icon" style="gap: 1rem">
        <IconContainer :icon="icon" fill="var(--accent-color)" />
        <p class="note zero-margin" :class="noteClass">{{ note }}</p>
        <p class="note zero-margin" v-if="$slots.default">
            <slot />
        </p>
    </HorizontalLayout>
</template>

<style scoped>
.notecard {
    --color-background-secondar: var(--primary-color);
    --accent-color: var(--primary-accent-color);
    --color-text-secondary: var(--primary-accent-color);

    align-items: baseline;
    background-color: var(--color-background-secondar);
    border-inline-start: 2px solid var(--accent-color);
    padding-block: 4px;
    padding-inline: 0.5rem;
    padding-inline-start: 1rem;
    transition: background-color 650ms ease;
    & .note {
        align-self: anchor-center;
    }

    &.info {
        --color-background-secondar: var(--neutral-color);
        --accent-color: var(--neutral-accent-color);
    }

    &.warning {
        --color-background-secondar: var(--warning-color);
        --accent-color: var(--warning-accent-color);
    }

    &.error {
        --color-background-secondar: var(--error-color);
        --accent-color: var(--error-accent-color);
    }

    &.success {
        --color-background-secondar: var(--success-color);
        --accent-color: var(--success-accent-color);
    }
}
</style>
