<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import {
    type DynamicallyConfiguredFormProps,
    formComponentsLookup,
    type FormControl,
    type FormGroup,
} from './';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import {
    createDynamicallyConfiguredFormEvents,
    destroyDynamicallyConfiguredFormEvents,
} from '@/components/dynamic-form/common/dynamically-configured-form.events.ts';
import IconContainer from '@/components/icons/IconContainer.vue';
import type { KeyValueMap } from '@/common/types.ts';

let form = ref<FormGroup<any>>({});

let isFormInvalid = ref(false);

const props = defineProps<DynamicallyConfiguredFormProps>();

const emit = defineEmits<{
    onSubmitClicked: [arg: KeyValueMap<FormControl<any>>];
}>();

const formEvent = createDynamicallyConfiguredFormEvents(props.formId);

function isFormValid(form: KeyValueMap<FormControl<any>>) {
    if (Object.keys(form).length === 0) return true;
    return Object.entries(form)
        .map(([, value]) => value.isValid)
        .reduce((prev, curr) => prev && curr);
}

const onSubmit = () => {
    if (isFormValid(form.value)) {
        isFormInvalid.value = false;
        emit('onSubmitClicked', form.value);
    } else {
        isFormInvalid.value = true;
    }
};

const getFieldComponentByType = (type: string) => {
    return formComponentsLookup[type];
};

const fieldTypeExists = (fieldType: string) => {
    return fieldType in formComponentsLookup;
};

watch(
    () => props.formConfiguration,
    () => {
        formEvent.RESET.next();
    },
);

onUnmounted(() => destroyDynamicallyConfiguredFormEvents(props.formId));
</script>

<template>
    <div
        style="
            display: flex;
            flex-direction: column;
            height: 100%;
            contain: strict;
            gap: var(--element-gap);
        "
    >
        <div
            style="max-height: calc(100% - 50px); overflow: auto; contain: layout"
            class="section-list-container"
        >
            <template v-for="(item, index) in formConfiguration" :key="index">
                <section>
                    <horizontal-layout>
                        <template v-if="fieldTypeExists(item.type)">
                            <component
                                v-model="form[index]"
                                :is="getFieldComponentByType(item.type)"
                                :name="index"
                                :parentId="formId"
                                v-bind="item"
                            />
                            <IconContainer
                                v-if="item.required"
                                icon="required"
                                label="Required"
                                class-name="field required"
                            />
                            <span v-else class="field optional">Optional</span>
                        </template>
                        <component
                            v-else
                            :is="getFieldComponentByType('field_not_implemented')"
                            :name="index"
                        />
                    </horizontal-layout>
                </section>
            </template>
        </div>
        <template v-if="formConfiguration">
            <button
                :disabled="disableSubmitButton"
                class="button"
                @click="onSubmit()"
                type="button"
            >
                Submit
            </button>
        </template>
        <template v-else>
            <h3 style="width: 8em">No Test Selected</h3>
        </template>
    </div>
    <DialogBoxWithDynamicContent
        v-model="isFormInvalid"
        title="The test cannot be launched due to some errors in the Form"
    />
</template>
<style>
.select-field.container {
    height: auto;
    width: 45%;
}

.select-field .open {
    max-height: 200px;
    border: 1px solid black;
    border-top: none;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: auto;
}

.section-list-container > section {
    margin-top: 24px;
}

.select-field .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: white;
    border: 1px solid black;
}

.select-field .footer {
    max-height: 100px;
    overflow: auto;
}

.select-field .header.folded {
    border-radius: 8px 8px 8px 8px;
}

.select-field .header.unfolded {
    border-radius: 8px 8px 0 0;
}

.select-field .header > .label {
    flex-grow: 1;
}

.select-field .header > .icon {
    justify-self: end;
}

.select-field .header > .icon.status {
    margin-left: var(--element-gap);
}

.select-field .close {
    overflow: hidden;
    max-height: 0;
    border-bottom: none;
}

.select-field .dropdown {
    padding-right: var(--element-gap);
    background: white;
    transition: max-height 150ms ease-in-out;
    contain: content;
    will-change: height;
}

.select-field .select-unselect-toggle {
    width: 17px;
    height: 17px;
}

.select-field .dropdown > .item > input[type='checkbox'] {
    margin-left: var(--element-gap);
}

.select-field .dropdown > .item {
    contain: strict;
    height: 25px;
    width: 100%;
}

.input-field {
    border: 1px solid black;
    border-radius: 5px;
    width: fit-content;
    height: 50px;
    background: white;
    padding: 1px;
    align-items: center;
    contain: layout;
}

.input-field > .label {
    height: 100%;
    align-content: center;
    background: white;
    border-right: 1px solid lightgray;
    padding: 0 var(--element-gap);
}

.input-field > .input-box {
    background: white;
    height: 100%;
    border: none;
    font-size: 12pt;
    outline: none;
}

.input-field > .input-box:focus {
    border: none;
    box-sizing: content-box;
    border-block: none;
}

.field {
    font-weight: bold;
    margin-left: var(--element-gap);

    &.required {
        align-self: baseline;
        color: var(--error-color);
    }

    &.optional {
        align-self: baseline;
        color: black;
    }
}

input[type='file']::file-selector-button {
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
    will-change: all;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}
</style>
