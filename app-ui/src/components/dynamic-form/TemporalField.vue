<script setup lang="ts">
import CorrectIncorrectStatusIcon from '@/components/icons/CorrectIncorrectStatusIcon.vue';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import type { TemporalFieldProps, FormControl } from '@/components/dynamic-form/index.ts';
import { useInputValidation } from '@/components/dynamic-form/common/input-validation.ts';

const props = defineProps<TemporalFieldProps>();
const model = defineModel<FormControl<Date>>({
    default: {
        isValid: false,
        data: new Date(),
    },
});
const { errorDialogBoxOpened, isValid, inputRef, onStatusIconClicked } = useInputValidation<Date>(
    props,
    model,
);
</script>

<template>
    <div class="flex-row-container input-field">
        <p class="zero-padding zero-margin unselectable label">
            {{ label }}
        </p>
        <input
            ref="inputRef"
            class="zero-padding zero-margin left-margin-small input-box"
            :id="name"
            :name="name"
            v-model="model.data"
            :required="required"
            :min="min"
            :max="max"
            :step="max"
            :type="type"
        />
        <CorrectIncorrectStatusIcon :is-correct="isValid" @click="onStatusIconClicked" />
    </div>
    <DialogBoxWithDynamicContent v-model="errorDialogBoxOpened" :title="label">
        {{ inputRef?.validationMessage }}
    </DialogBoxWithDynamicContent>
</template>
