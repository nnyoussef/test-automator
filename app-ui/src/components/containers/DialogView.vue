<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import type { DialogBoxWithDynamicContentProps } from '@/components/containers/index.ts';

const model = defineModel<boolean>({
    default: false,
});
const dialogBox = ref<HTMLDialogElement>();
defineProps<DialogBoxWithDynamicContentProps>();
onMounted(() => {
    if (model.value) dialogBox.value?.showModal();
    watch(
        () => model.value,
        (newVal) => {
            if (newVal) {
                dialogBox.value?.showModal();
            }
        },
    );
});
const close = () => {
    dialogBox.value?.close();
    model.value = false;
};
</script>

<template>
    <dialog ref="dialogBox">
        <div class="dialog-content flex-column-container centered-content" style="width: 1000px">
            <h3 style="color: var(--primary-color)">
                {{ title }}
            </h3>
            <div style="max-height: 300px; overflow: auto">
                <slot></slot>
            </div>
            <button
                style="text-align: center; margin-left: 0"
                type="button"
                @click="close"
                class="button"
            >
                Close
            </button>
        </div>
    </dialog>
</template>

<style lang="css" scoped>
dialog {
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
    transition: display 20s ease-in-out;
}

dialog::backdrop {
    backdrop-filter: blur(1px);
}
</style>
