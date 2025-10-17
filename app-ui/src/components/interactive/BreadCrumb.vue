<script setup lang="ts">
import type { BreadCrumbProps } from '@/components/interactive';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import IconContainer from '@/components/icons/IconContainer.vue';

withDefaults(defineProps<BreadCrumbProps>(), {
    itemsSeperator: '/',
});
const emits = defineEmits<{
    onItemClicked: [value: string];
}>();

function onItemClicked(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    let el: HTMLElement = (
        target instanceof SVGElement ? target.parentElement : target
    ) as HTMLElement;
    emits('onItemClicked', el.dataset.elementValue ?? '');
}
</script>

<template>
    <HorizontalLayout>
        <TransitionGroup
            name="fade"
            tag="ul"
            class="breadcrumb"
            :style="{ '--items-separator': `'${itemsSeperator}'` }"
            @click="onItemClicked($event)"
        >
            <template v-for="item of items" :key="item.value">
                <IconContainer
                    v-if="item.iconName"
                    :icon="item.iconName"
                    :fill="item.iconColor ?? 'var(--primary-color)'"
                    button-value=""
                ></IconContainer>
                <li v-else :data-element-value="item.value">
                    <a :data-element-value="item.value">{{ item.label }}</a>
                </li>
            </template>
        </TransitionGroup>
    </HorizontalLayout>
</template>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
</style>
