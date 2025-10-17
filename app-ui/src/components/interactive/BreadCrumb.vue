<script setup lang="ts">
import type { BreadCrumbProps } from '@/components/interactive';
import HorizontalBox from '@/components/layouts/HorizontalBox.vue';
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
    emits('onItemClicked', el.dataset.value ?? '');
}
</script>

<template>
    <HorizontalBox>
        <TransitionGroup
            name="fade"
            tag="ul"
            class="breadcrumb"
            :style="{ '--items-separator': `'${itemsSeperator}'` }"
            @click="onItemClicked($event)"
        >
            <li v-for="item of items" :key="item.value">
                <IconContainer
                    v-if="item.iconName"
                    :icon="item.iconName"
                    :fill="item.iconColor ?? 'var(--primary-color)'"
                    :value="item.value"
                />
                <a v-else :data-value="item.value">{{ item.label }}</a>
            </li>
        </TransitionGroup>
    </HorizontalBox>
</template>

<style src="@/assets/styles/component/breadcrumb.css" scoped />
