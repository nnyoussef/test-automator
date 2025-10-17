<template>
    <transition name="popup-fade">
        <div
            v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            @keydown.esc="onEsc"
            role="dialog"
            :aria-modal="true"
            :aria-label="ariaLabel"
        >
            <!-- Backdrop -->
            <div
                class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                @click="onBackdropClick"
            ></div>

            <!-- Panel -->
            <div
                ref="panel"
                class="relative w-full max-w-lg mx-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
                :class="sizeClass"
                @click.stop
            >
                <!-- Header -->
                <header v-if="showHeader" class="flex items-center justify-between p-4 border-b">
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                    <button
                        class="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                        @click="close('close-button')"
                        aria-label="Close dialog"
                    >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 6l12 12M6 18L18 6"
                            />
                        </svg>
                    </button>
                </header>

                <!-- Body (slot) -->
                <section class="p-4" tabindex="0">
                    <slot />
                </section>

                <!-- Footer -->
                <footer v-if="showFooter" class="flex items-center justify-end gap-2 p-4 border-t">
                    <button
                        v-if="showCancel"
                        class="px-4 py-2 rounded-md hover:bg-gray-100"
                        @click="cancel"
                    >
                        {{ cancelText }}
                    </button>

                    <button
                        class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        @click="ok"
                    >
                        {{ okText }}
                    </button>
                </footer>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';

interface Props {
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    showHeader?: boolean;
    showFooter?: boolean;
    showCancel?: boolean;
    okText?: string;
    cancelText?: string;
    ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    size: 'md',
    closeOnBackdrop: true,
    closeOnEsc: true,
    showHeader: true,
    showFooter: true,
    showCancel: true,
    okText: 'OK',
    cancelText: 'Cancel',
    ariaLabel: 'Dialog',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'ok'): void;
    (e: 'cancel'): void;
    (e: 'close', reason?: string): void;
}>();

const panel = ref<HTMLElement | null>(null);

const modelValue = computed({
    get: () => props.modelValue,
    set: (v: boolean) => emit('update:modelValue', v),
});

watch(
    () => props.modelValue,
    (val) => {
        if (val) focusFirstElement();
    },
);

function close(reason?: string) {
    modelValue.value = false;
    emit('close', reason);
}

function ok() {
    emit('ok');
    close('ok');
}

function cancel() {
    emit('cancel');
    close('cancel');
}

function onBackdropClick() {
    if (props.closeOnBackdrop) close('backdrop');
}

function onEsc() {
    if (props.closeOnEsc) close('esc');
}

// Basic focus management: move focus into dialog when opened and restore on close
let previouslyFocused: Element | null = null;

function focusFirstElement() {
    previouslyFocused = document.activeElement;
    // try to focus first focusable inside panel
    requestAnimationFrame(() => {
        if (!panel.value) return;
        const focusable = panel.value.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        (focusable || panel.value).focus();
    });
}

function restoreFocus() {
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
}

watch(
    () => props.modelValue,
    (open, prev) => {
        if (!open && prev) restoreFocus();
    },
);

onBeforeUnmount(() => restoreFocus());

onMounted(() => {
    // prevent page scroll while open
    watch(
        () => props.modelValue,
        (open) => {
            document.body.style.overflow = open ? 'hidden' : '';
        },
        { immediate: true },
    );
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'max-w-sm';
        case 'lg':
            return 'max-w-2xl';
        case 'xl':
            return 'max-w-4xl';
        default:
            return 'max-w-lg';
    }
});
</script>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
    transition:
        opacity 160ms ease,
        transform 160ms ease;
}
.popup-fade-enter-from,
.popup-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.995);
}
</style>

<!--
Usage example:

<template>
  <button @click="open = true">Open</button>
  <Popup v-model:modelValue="open" title="Hello!">
    <p>This is the popup content.</p>
  </Popup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Popup from './Popup.vue'
const open = ref(false)
</script>
-->
