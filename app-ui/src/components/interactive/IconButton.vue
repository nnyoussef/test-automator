<script lang="ts" setup>
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import IconContainer from '@/components/icons/IconContainer.vue';
import { ref, watchEffect } from 'vue';
import type { IconButtonProps } from '@/components/interactive/index.ts';
import TooltipView from '@/components/containers/TooltipView.vue';

const props = withDefaults(defineProps<IconButtonProps>(), {
    iconClassName: '',
    isDarkTheme: false,
    disabled: false,
    disableHoverCss: false,
    tooltipShow: false,
    tooltipContent: '',
});

const anchorName: Readonly<string> = `--${props.buttonId}`;

const iconContainerClassName = ref([props.iconClassName]);
watchEffect(() => {
    if (props.animationInProgress) {
        iconContainerClassName.value = [props.iconClassName, props.animationName ?? ''];
    } else {
        iconContainerClassName.value = [props.iconClassName];
    }
});
</script>
<template>
    <div>
        <button
            :disabled="disabled"
            class="icon-button anchor"
            :class="disableHoverCss ? ' no-hover' : ''"
            :style="{
                '--color': buttonTextColor,
                anchorName,
            }"
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
                    :role="buttonRole"
                    :value="buttonValue"
                />
                {{ buttonLabel }}
            </HorizontalLayout>
        </button>
        <TooltipView :anchorName="anchorName" :tooltipShow="tooltipShow">
            {{ tooltipContent }}
        </TooltipView>
    </div>
</template>
<style scoped></style>
