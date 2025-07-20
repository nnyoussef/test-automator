<script lang="ts" setup>
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import IconContainer from '@/components/icons/IconContainer.vue';
import { ref, watchEffect } from 'vue';
import type { IconButtonProps } from '@/components/interactive/index.ts';

const props = withDefaults(defineProps<IconButtonProps>(), {
    iconClassName: '',
    isDarkTheme: false,
    disabled: false,
    disableHoverCss: false,
});

const iconContainerClassName = ref(props.iconClassName);
watchEffect(() => {
    if (props.animationInProgress) {
        iconContainerClassName.value = `${props.iconClassName} ${props.animationName}`;
    } else {
        iconContainerClassName.value = `${props.iconClassName}`;
    }
});
</script>
<template>
    <button
        :disabled="disabled"
        class="icon-button"
        :class="disableHoverCss ? ' no-hover' : ''"
        :style="{ '--color': buttonTextColor }"
        :title="buttonLabel"
        :data-role="buttonRole"
        :data-element-value="buttonValue"
        type="button"
        :id="buttonId"
    >
        <HorizontalLayout
            :data-element-value="buttonValue"
            style="gap: 4px"
            :data-role="buttonRole"
        >
            <IconContainer
                :fill="iconColor ?? buttonTextColor"
                :icon="icon"
                :class-name="iconContainerClassName"
                :size="iconSize"
                :data-role="buttonRole"
                :data-element-value="buttonValue"
            />
            {{ buttonLabel }}
        </HorizontalLayout>
    </button>
</template>
