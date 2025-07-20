<script setup lang="ts">
import CorrectIncorrectStatusIcon from '@/components/icons/CorrectIncorrectStatusIcon.vue';
import { ref } from 'vue';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import type { FileSelectFieldProps, FormControl } from '@/components/dynamic-form/index.ts';

const props = defineProps<FileSelectFieldProps>();
defineModel<FormControl<File>>({
    default: {
        isValid: false,
        data: 0,
    },
});
const errorDialogBoxOpened = ref(false);
const isValid = ref(false);
const inputRef = ref<HTMLInputElement>();
const isValidFunction = () => {
    const input: HTMLInputElement = <HTMLInputElement>inputRef.value;
    return input.validity.valid || (!props.required && inputRef.value?.value === '');
};
const onStatusIconClicked = () => {
    if (!isValidFunction()) {
        errorDialogBoxOpened.value = true;
    }
};
</script>

<template>
    <div class="flex-row-container input-field">
        <p class="zero-padding zero-margin unselectable label">
            {{ label }}
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
        <CorrectIncorrectStatusIcon :is-correct="isValid" @click="onStatusIconClicked" />
    </div>
    <DialogBoxWithDynamicContent v-model="errorDialogBoxOpened" :title="label">
        {{ inputRef?.validationMessage }}
    </DialogBoxWithDynamicContent>
</template>
