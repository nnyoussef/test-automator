<template>
    <div class="flex-column-container" :class="centeredItems ? 'centered-content' : ''">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ centeredItems?: boolean }>(), {
    centeredItems: false,
});
</script>
