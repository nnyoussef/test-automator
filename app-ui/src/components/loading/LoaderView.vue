<template>
    <div v-if="inprogress" class="loader" style="width: 50px; height: 50px">
        <svg width="50" height="50">
            <circle
                cx="25"
                cy="25"
                r="15"
                fill="none"
                stroke="rgba(128, 128, 128, 0.2)"
                stroke-width="5"
                class="circle"
            />
            <path
                d="M10 25 A 15 15, 0, 0, 1, 25 10"
                fill="none"
                stroke-width="5"
                stroke="var(--primary-color)"
            />
        </svg>
    </div>
</template>

<script setup lang="ts">
defineProps<{ inprogress: boolean }>();
</script>

<style lang="css" scoped>
.loader {
    animation: spin 0.4s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
