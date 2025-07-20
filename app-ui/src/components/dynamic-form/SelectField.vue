<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import DropDownIcon from '@/components/icons/DropDownIcon.vue';
import CorrectIncorrectStatusIcon from '@/components/icons/CorrectIncorrectStatusIcon.vue';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import { getDynamicallyConfiguredFormEventsById } from '@/components/dynamic-form/common/dynamically-configured-form.events.ts';
import ChipView from '@/components/containers/ChipView.vue';
import type { FormControl, SelectFieldProps } from '@/components/dynamic-form/index.ts';

const props = defineProps<SelectFieldProps>();
const formEvent = getDynamicallyConfiguredFormEventsById(props.parentId);

const validate = (newVal: string[]) => {
    return (
        newVal?.length! >= (props.minSelection ?? 1) &&
        newVal?.length! <= (props.maxSelections ?? 1)
    );
};

const selectionBoxContainer = ref<HTMLDivElement>();
const errorDialogBoxState = ref(false);
const isOpen = ref(false);
const isValid = ref(validate(props.defaultValue));
const noItemSelectedChipIsVisible = ref(false);
const model = defineModel<FormControl<string[]>>({
    default: {
        data: [],
        isValid: false,
    },
});
let selectUnSelectAllCheckbox = useTemplateRef<HTMLInputElement>('selectUnSelectAllCheckbox');
let dropDownHeaderClassName = ref<string>();
let dropDownBodyClassName = ref<string>();
const errorMessage = ref<string>();

// definition des functions
const close = () => {
    setTimeout(() => {
        isOpen.value = false;
        dropDownBodyClassName.value = 'dropdown select-field close';
        setTimeout(() => (dropDownHeaderClassName.value = 'folded'));
    });
};
const open = () => {
    setTimeout(() => {
        isOpen.value = true;
        dropDownBodyClassName.value = 'dropdown select-field open';
        requestAnimationFrame(() => (dropDownHeaderClassName.value = 'unfolded'));
    });
};
const toggleFunctions: Record<string, () => void> = {
    true: close,
    false: open,
};

const setSelectAllCheckboxState = (selectedElements: any[]) => {
    if (selectedElements!.length === 0) {
        selectUnSelectAllCheckbox.value!.checked = false;
        selectUnSelectAllCheckbox.value!.indeterminate = false;
    } else if (selectedElements!.length === props.options.length) {
        selectUnSelectAllCheckbox.value!.checked = true;
        selectUnSelectAllCheckbox.value!.indeterminate = false;
    } else {
        selectUnSelectAllCheckbox.value!.indeterminate = true;
    }
};
const toggleSelectUnSelectAll = () => {
    if (!selectUnSelectAllCheckbox.value!.indeterminate) {
        if (!selectUnSelectAllCheckbox.value!.checked) {
            model.value = {
                data: [],
                isValid: model.value.isValid || !props.required,
            };
        } else {
            model.value = {
                data: props.options,
                isValid: model.value.isValid || !props.required,
            };
        }
    }
};
const getErrorMessage: () => string = () => {
    if (props.minSelection == undefined && props.maxSelections == undefined) {
        return 'You are allowed to select only one Item';
    }
    return `Your are allowed to selected ${props.minSelection} to ${props.maxSelections} items`;
};
const statusIconClicked = () => {
    if (!isValid.value) {
        errorDialogBoxState.value = true;
    }
};

onMounted(() => {
    const resetFieldToDefault = () => {
        model.value = {
            data: props.defaultValue,
            isValid: isValid.value || !props.required,
        };
    };
    formEvent?.RESET.subscribe(resetFieldToDefault);
    errorMessage.value = getErrorMessage();
    resetFieldToDefault();
    open();
    requestIdleCallback(() => setSelectAllCheckboxState(props.defaultValue));
    watch(
        () => model.value.data,
        (newVal) => {
            requestIdleCallback(() => setSelectAllCheckboxState(model.value!.data));
            if (isValid.value !== validate(newVal)) {
                isValid.value = !isValid.value;
                model.value = {
                    data: model.value.data,
                    isValid: isValid.value || !props.required,
                };
            }
            noItemSelectedChipIsVisible.value = model.value.data.length === 0;
        },
    );
});
</script>

<template>
    <div class="select-field container">
        <div class="header" :class="dropDownHeaderClassName">
            <p class="unselectable label">
                {{ label }}
            </p>
            <DropDownIcon
                class="unselectable icon"
                @click="toggleFunctions[String(isOpen)]"
                :is-down="!Boolean(isOpen)"
            ></DropDownIcon>
            <CorrectIncorrectStatusIcon
                class="icon status"
                :is-correct="isValid"
                @click="statusIconClicked"
            />
            <input
                ref="selectUnSelectAllCheckbox"
                type="checkbox"
                class="select-unselect-toggle"
                @click="toggleSelectUnSelectAll"
            />
        </div>
        <div ref="selectionBoxContainer" :class="dropDownBodyClassName">
            <div v-for="(option, index) in options" :key="option" class="item">
                <input
                    :id="`${name}_${index}`"
                    :name="name"
                    v-model="model!.data"
                    :value="option"
                    type="checkbox"
                />
                <label class="unselectable" :for="`${name}_${index}`">
                    {{ option }}
                </label>
            </div>
        </div>
        <div class="footer">
            <ChipView
                v-show="noItemSelectedChipIsVisible"
                text-color="crimson"
                text="No items selected."
            />
            <TransitionGroup name="list">
                <ChipView v-for="item in model.data" :key="item" :text="item" />
            </TransitionGroup>
        </div>
    </div>

    <DialogBoxWithDynamicContent v-model="errorDialogBoxState" :title="label">
        {{ errorMessage }}
    </DialogBoxWithDynamicContent>
</template>
