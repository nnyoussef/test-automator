<script setup lang="ts">
defineProps({
    title: String,
});
</script>

<template>
    <div class="vertical-layout">
        <div class="title">
            <slot name="title"></slot>
        </div>
        <div class="body">
            <slot name="body"></slot>
        </div>
    </div>
</template>
<style>
.vertical-layout {
    height: calc(100% - 2px);
    width: calc(100% - 3px);
    contain: strict;
    display: flex;
    flex-direction: column;
    border: 1px solid lightgray;
}

.vertical-layout > .title {
    background: #eceff1;
    border-bottom: 1px solid lightgray;
    padding-right: 18px;
    height: 40px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
    color: var(--primary-accent-color);
    font-family: monospace;
    font-size: 12pt;
    font-weight: bold;
    margin: 0 0 0 0;
    padding-left: var(--element-gap);
    align-content: center;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--element-gap);
}

.vertical-layout > .body {
    flex-grow: 1;
    contain: strict;
    overflow: auto;
}
</style>
