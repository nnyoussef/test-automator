<script setup lang="ts">
import CorrectIncorrectStatusIcon from '@/components/icons/CorrectIncorrectStatusIcon.vue';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import type { FormControl, NumberFieldProps } from '@/components/dynamic-form/index.ts';
import { useInputValidation } from '@/components/dynamic-form/common/input-validation.ts';

const props = defineProps<NumberFieldProps>();
const model = defineModel<FormControl<number>>({
    default: {
        isValid: false,
        data: undefined,
    },
});
const { errorDialogBoxOpened, isValid, inputRef, onStatusIconClicked } = useInputValidation(
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
            class="zero-padding zero-margin left-margin-small input-box"
            type="number"
            :id="name"
            ref="inputRef"
            :name="name"
            :required="required"
            v-model="model.data"
            :min="minValue"
            :max="maxValue"
            :step="step"
            :placeholder="placeHolder"
        />
        <CorrectIncorrectStatusIcon :is-correct="isValid" @click="onStatusIconClicked" />
    </div>
    <DialogBoxWithDynamicContent v-model="errorDialogBoxOpened" :title="label">
        {{ inputRef?.validationMessage }}
    </DialogBoxWithDynamicContent>
</template>
