<script setup lang="ts">
import type { FormControl, NumberFieldProps } from '@/components/dynamic-form/index.ts';
import { useInputValidation } from '@/components/dynamic-form/common/input-validation.ts';
import IconButton from '@/components/interactive/IconButton.vue';

const props = defineProps<NumberFieldProps>();
const model = defineModel<FormControl<number>>({
    default: {
        isValid: false,
        data: undefined,
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
