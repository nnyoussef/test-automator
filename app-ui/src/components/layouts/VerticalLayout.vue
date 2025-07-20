<template>
    <div
        class="flex-column-container layout-containment"
        :class="centeredItems ? 'centered-content' : ''"
    >
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
defineProps({ centeredItems: { type: Boolean } });
</script>
