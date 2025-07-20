<script setup lang="ts">
import type { ButtonListProps } from '@/components/interactive/index.ts';
import { ref, watchEffect } from 'vue';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';

const props = withDefaults(defineProps<ButtonListProps>(), {
    seperator: '',
    role: 'horizontal-action-button',
});

const emits = defineEmits<(event: 'itemClicked', value: string[]) => void>();

const list = ref([] as string[]);
watchEffect(() => {
    list.value =
        typeof props.values === 'string' ? props.values.split(props.seperator) : props.values;
});
const onItemClicked = (event: MouseEvent) => {
    const target = event.target as HTMLButtonElement;
    const index = Number(target.getAttribute('data-element-value') ?? '0');
    emits('itemClicked', list.value.slice(0, index + 1));
    requestAnimationFrame(() => target.setAttribute('data-selected', 'true'));
};
</script>

<template>
    <HorizontalLayout @click="onItemClicked($event)">
        <template v-for="(item, index) of list">
            <button :data-role="role" :data-element-value="index">
                {{ item }}
            </button>
            <span :data-role="`list-${seperator}`" v-if="index < list.length - 1">
                {{ seperator }}
            </span>
        </template>
    </HorizontalLayout>
</template>

<style scoped>
button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    margin-top: 0;

    &:hover,
    &[data-selected='true'] {
        margin-top: 2px;
        border-bottom: var(--border-thick-solid) var(--primary-color);
    }
}
</style>
