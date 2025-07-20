<script setup lang="ts">
import CorrectIncorrectStatusIcon from '@/components/icons/CorrectIncorrectStatusIcon.vue';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import type { FormControl, TextFieldProps } from '@/components/dynamic-form/index.ts';
import { useInputValidation } from '@/components/dynamic-form/common/input-validation.ts';

const props = defineProps<TextFieldProps>();
const model = defineModel<FormControl<string>>({
    default: {
        isValid: false,
        data: '',
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
            ref="inputRef"
            class="zero-padding zero-margin left-margin-small input-box"
            type="text"
            :id="name"
            :name="name"
            :required="required"
            :pattern="pattern"
            v-model="model.data"
            :minlength="minLength"
            :maxlength="maxLength"
            :placeholder="placeHolder"
        />
        <CorrectIncorrectStatusIcon :is-correct="isValid" @click="onStatusIconClicked" />
    </div>
    <DialogBoxWithDynamicContent v-model="errorDialogBoxOpened" :title="label">
        {{ inputRef?.validationMessage }}
    </DialogBoxWithDynamicContent>
</template>
