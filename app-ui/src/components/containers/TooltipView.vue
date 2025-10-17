<script setup lang="ts">
import VerticalBox from '@/components/layouts/VerticalBox.vue';
import type { TooltipViewProps } from '@/components/containers/index.ts';
import IconContainer from '@/components/icons/IconContainer.vue';

defineProps<TooltipViewProps>();
</script>

<template>
    <Transition name="fade">
        <VerticalBox
            :centered-items="true"
            v-if="tooltipShow"
            :style="{ positionAnchor: anchorName }"
            class="tooltip"
        >
            <IconContainer height="4px" class="marker" icon="arrowup" />
            <div class="content">
                <slot />
            </div>
        </VerticalBox>
    </Transition>
</template>

<style scoped>
.tooltip {
    position: fixed;
    top: anchor(bottom);
    justify-self: anchor-center;
    margin-top: 0;
    max-width: 100px;

    & .marker {
        height: 4px;
    }
    & .content {
        background-color: rgb(50, 50, 50);
        border-radius: 5px;
        padding: 0.5rem;
        color: white;
        white-space: normal;
        overflow-wrap: anywhere;
    }
}
</style>
