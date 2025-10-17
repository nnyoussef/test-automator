<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import {
    type DynamicallyConfiguredFormProps,
    formComponentsLookup,
    type FormControl,
    type FormControlDataType,
    type FormGroup,
} from './';
import DialogView from '@/components/containers/DialogView.vue';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import {
    createDynamicallyConfiguredFormEvents,
    destroyDynamicallyConfiguredFormEvents,
} from '@/components/dynamic-form/common/form.events.ts';
import type { KeyValueMap } from '@/common/types.ts';
import NoteCardView from '@/components/containers/NoteCardView.vue';

let form = ref<FormGroup<FormControlDataType>>({});

let isFormInvalid = ref(false);

const props = defineProps<DynamicallyConfiguredFormProps>();

const emit = defineEmits<{
    onSubmitClicked: [arg: KeyValueMap<FormControl<FormControlDataType>>];
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

const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const data = target.dataset;
    if (data?.role === 'tooltip') {
        formEvent.TOOLTIP_CLICKED.next(data.elementValue);
        return;
    }
    formEvent.TOOLTIP_CLICKED.next(undefined);
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
            @click="onClick"
            style="max-height: calc(100% - 50px); overflow: auto; contain: layout"
            class="section-list-container"
        >
            <template v-for="(item, key, index) in formConfiguration" :key="key">
                <section :style="{ zIndex: -index, position: 'relative' }">
                    <horizontal-layout style="gap: 48px">
                        <template v-if="fieldTypeExists(item.type)">
                            <component
                                class="field"
                                style="flex-grow: 1; width: 50%"
                                v-model="form[key]"
                                :is="getFieldComponentByType(item.type)"
                                :name="key"
                                :parentId="formId"
                                v-bind="item"
                            />
                            <NoteCardView
                                class="notice"
                                style="align-self: baseline; width: 50%"
                                :note="form[key]?.message"
                                :type="form[key]?.isValid ? 'success' : 'error'"
                            />
                        </template>
                        <component
                            v-else
                            :is="getFieldComponentByType('field_not_implemented')"
                            :name="key"
                            :type="item.type"
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
    <DialogView
        v-model="isFormInvalid"
        title="The test cannot be launched due to some errors in the Form"
    >
        <template v-for="(item, index) in form" :key="index">
            <NoteCardView v-if="!item.isValid" type="error">
                <span>
                    Input {{ index }} is invalid with the following message:
                    <strong>{{ item.message }}</strong>
                </span>
            </NoteCardView>
        </template>
    </DialogView>
</template>
<style>
.section-list-container > section {
    margin: var(--element-gap);
    contain: layout;
    position: relative;

    & > div {
        & > * {
            position: relative;
        }

        & > .field {
            z-index: 1;
        }

        & > .notice {
            z-index: 0;
        }
    }
}

.select-field.container {
    width: 45%;
    height: auto;
}

.select-field .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid black;
    border-radius: 8px 8px 0 0;
    z-index: 1;
    position: relative;
}

.select-field .footer {
    max-height: 80px;
    overflow: auto;
    border: 1px solid black;
    border-top: none;
    border-radius: 0 0 8px 8px;
    z-index: 0;
    position: relative;
}

.select-field .header > .label {
    flex-grow: 1;
}

.select-field .header > .icon,
.select-field .header > .icon.status {
    justify-self: end;
    margin-left: var(--element-gap);
}

.select-field .dropdown {
    padding-right: var(--element-gap);
    contain: content;
    max-height: 200px;
    overflow: auto;
    border: 1px solid black;
    border-top: none;
    position: relative;
    z-index: 0;
}

.select-field .select-unselect-toggle {
    width: 17px;
}

.select-field .dropdown > .item {
    contain: strict;
    height: 25px;
    width: 100%;
}

.select-field .dropdown > .item > input[type='checkbox'] {
    margin-left: var(--element-gap);
}

.input-field {
    border: 1px solid black;
    border-radius: 5px;
    width: fit-content;
    height: 50px;
    padding: 1px;
    align-items: center;
}

.input-field > .label {
    height: 100%;
    align-content: center;
    border-right: 1px solid lightgray;
    padding: 0 var(--element-gap);
    width: max-content;
}

.input-field > .input-box {
    height: 100%;
    border: none;
    font-size: 12pt;
    outline: none;
    flex: 1;
}

.input-field > .input-box:focus {
    border: none;
    box-sizing: content-box;
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
