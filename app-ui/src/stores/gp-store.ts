import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { KeyValueMap } from '@/common/types.ts';

export const useGpState = defineStore('gp', () => {
    // --- STATE ---
    const state = ref<KeyValueMap>({});

    // --- GETTERS ---
    const getByKeys = <T>(component: string, variableName: string, defaultValue: T) => {
        if (!state.value[component]) return defaultValue;
        return state.value[component][variableName] ?? defaultValue;
    };

    // --- ACTIONS ---
    function putByKey(component: string, variableName: string, value: unknown): void {
        state.value[component] ??= {};
        state.value[component][variableName] = value;
    }

    return {
        state,
        getByKeys,
        putByKey,
    };
});
