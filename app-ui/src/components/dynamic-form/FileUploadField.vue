<script setup lang="ts">
import { ref } from 'vue';
import type { FileSelectFieldProps, FormControl } from '@/components/dynamic-form/index.ts';

const props = defineProps<FileSelectFieldProps>();
defineModel<FormControl<File>>({
    default: {
        isValid: false,
        data: 0,
    },
});
const inputRef = ref<HTMLInputElement>();
</script>

<template>
    <div class="flex-row-container input-field">
        <p class="zero-padding zero-margin unselectable label">
            {{ label }}
            <i v-if="!required" class="unselectable"><small>(Optional)</small></i>
        </p>
        <input
            class="zero-padding zero-margin left-margin-small input-box"
            type="file"
            :size="maxSize"
            accept="application/json,application/zip,application/xml"
            :multiple="false"
            :id="name"
            ref="inputRef"
            :name="name"
            :required="required"
            :placeholder="placeHolder"
        />
    </div>
</template>
