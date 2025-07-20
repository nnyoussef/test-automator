<template>
    <div :style="{ width: `${size}px`, height: `${size}px` }">
        <svg :width="size" :height="size">
            <circle
                :cx="cx"
                :cy="cy"
                :r="r"
                fill="none"
                stroke="rgba(128, 128, 128, 0.2)"
                :stroke-width="strokeWidth"
                class="circle"
            />
            <path :d="d" fill="none" :stroke-width="strokeWidth" stroke="var(--primary-color)" />
        </svg>
        <p
            class="inprogress"
            ref="text"
            :style="{ width: `${size}px`, fontSize: `${size * 0.1}pt` }"
        >
            <span v-if="!isInDone">{{ percent }}%</span>
            <span class="fade-in" v-else>
                <CorrectIncorrectStatusIcon :is-correct="true" />
                Done
            </span>
        </p>
    </div>
</template>

<script setup lang="ts">
import CorrectIncorrectStatusIcon from '@/components/icons/CorrectIncorrectStatusIcon.vue';
import { onMounted, ref, watch } from 'vue';
import type { CircularProgressBarProps } from '@/components/loading/index.ts';

let props = defineProps<CircularProgressBarProps>();

const cx = props.size / 2;
const cy = props.size / 2;
const r = props.size / 3.3333;
const rad = Math.PI / 180;
const text = ref<HTMLElement>();
const startX = cx - r;
const startY = cy;
let d = ref(calculateArcPath(props.percent));
let isInDone = ref(false);
onMounted(() => {
    text.value!.style.top = `${-cx - text.value!.scrollHeight * 0.5}px`;
});
watch(
    () => props.percent,
    (value, oldValue) => {
        isInDone.value = props.percent >= 100;
        text.value!.className = isInDone.value ? 'done' : 'inprogress';
        if (props.percent <= 100)
            requestAnimationFrame(() => {
                d.value = calculateArcPath(props.percent.valueOf());
            });
    },
);

function calculateArcPath(percent: number) {
    const endAngle = (percent / 100) * 359.99999;
    const endX = cx + r * Math.cos((180 - endAngle) * rad);
    const endY = cy - r * Math.sin((180 - endAngle) * rad);
    const largeArcFlag = endAngle > 180 ? 1 : 0;
    const arcPath = `M ${startX},${startY} A ${r},${r} 0 ${largeArcFlag},1 ${endX},${endY}`;
    return arcPath.trim();
}
</script>

<style lang="css" scoped>
p.inprogress {
    position: relative;
    margin: 0;
    text-align: center;
    color: var(--primary-color);
}

p.done {
    position: relative;
    margin: 0;
    text-align: center;
    color: green;
    animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
