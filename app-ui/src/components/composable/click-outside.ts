import { type Ref } from 'vue';

export function useClickOutside<T>(
    target: Ref<T>,
    valueIfOutsideClick: T,
    abortController: AbortController = new AbortController(),
) {
    globalThis.addEventListener(
        'click',
        () => {
            target.value = valueIfOutsideClick;
        },
        abortController,
    );
}
