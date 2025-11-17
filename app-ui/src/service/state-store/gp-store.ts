import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { KeyValueMap } from '@/common/types.ts';

export const useGpState = defineStore('gp', () => {
    // --- STATE ---
    const state = ref<KeyValueMap>({});

    // --- GETTERS ---
    const getByKeys = <T>(component: string, variableName: string, defaultValue: T) => {
        if (!state.value[component]) return defaultValue;
        return (state.value[component][variableName] satisfies T) ?? defaultValue;
    };

    // --- ACTIONS ---
    function putByKey<T>(component: string, variableName: string, value: T): void {
        state.value[component] ??= {};
        (state.value[component][variableName] satisfies T) = value;
    }

    return {
        state,
        getByKeys,
        putByKey,
    };
});
