<script setup lang="ts">
import NoteCardView from '@/components/containers/NoteCardView.vue';

defineProps({
    name: {
        type: String,
    },
    type: {
        type: String,
    },
});
</script>

<template>
    <NoteCardView
        type="warning"
        noteClass="field-not-implemented"
        :note="`Field ${name} of type ${type} view not implemented`"
    />
</template>
<style>
.field-not-implemented {
    font-size: 1rem;
    font-weight: bold;
}
</style>
