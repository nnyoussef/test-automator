<script setup lang="ts">
import type { FormControl, TextFieldProps } from '@/components/dynamic-form/index.ts';
import { useInputValidation } from '@/components/dynamic-form/common/input-validation.ts';
import IconButton from '@/components/interactive/IconButton.vue';

const props = defineProps<TextFieldProps>();
const model = defineModel<FormControl<string>>({
    default: {
        isValid: false,
        data: '',
    },
});
const { inputRef, tooltipShow } = useInputValidation(props, model);
</script>

<template>
    <div class="flex-row-container input-field">
        <p class="zero-padding zero-margin unselectable label">
            {{ label }}
            <i v-if="!required" class="unselectable"><small>(Optional)</small></i>
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
        <IconButton
            :tooltipShow="tooltipShow"
            :tooltipContent="description"
            :buttonId="`${parentId}-${name}-tooltip`"
            buttonTextColor="var(--neutral-accent-color)"
            icon="question"
            buttonRole="tooltip"
            :buttonValue="name"
        />
    </div>
</template>
