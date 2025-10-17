<script setup lang="ts">
import type { FormControl, TemporalFieldProps } from '@/components/dynamic-form/index.ts';
import { useInputValidation } from '@/components/dynamic-form/common/input-validation.ts';

const props = defineProps<TemporalFieldProps>();
const model = defineModel<FormControl<Date>>({
    default: {
        isValid: false,
        data: new Date(),
    },
});
const { inputRef } = useInputValidation<Date>(props, model);
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
            :id="name"
            :name="name"
            v-model="model.data"
            :required="required"
            :min="min"
            :max="max"
            :step="max"
            :type="type"
        />
    </div>
</template>
