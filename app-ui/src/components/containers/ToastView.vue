<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { ToastViewProps } from '@/components/containers/index.ts';
import IconButton from '@/components/interactive/IconButton.vue';

const props = withDefaults(defineProps<ToastViewProps>(), {
    duration: 5000,
    limit: 5,
});

let toastId = 0;
const items = ref<(ToastViewProps['content'] & { id: number })[]>([]);
const overflowReserve: typeof items.value = [];
onMounted(() => {
    watch(
        () => props.content,
        (newVal) => {
            requestIdleCallback(() => {
                const { value: list } = items;

                if (!newVal) return;
                const item = { ...newVal, id: toastId++ };

                if (list.length >= props.limit) {
                    overflowReserve.push(item);
                    return;
                }
                // Add new item
                list.push(item);
            });
        },
    );
    setInterval(() => {
        requestIdleCallback(() => {
            if (items.value.length > 0) {
                items.value.shift();
                if (overflowReserve.length > 0) {
                    items.value.push(overflowReserve.shift() as (typeof items.value)[number]);
                }
            }
        });
    }, props.duration ?? 5000);
});
</script>

<template>
    <Teleport :to="to">
        <TransitionGroup name="list-item-slide">
            <template v-for="(item, index) in items" :key="item.id">
                <div class="toast" :class="item.type" :data-index="item.id">
                    <span>{{ item.message }}</span>
                    <IconButton icon="close" class="close" @click="items.splice(index, 1)" />
                </div>
            </template>
        </TransitionGroup>
    </Teleport>
</template>

<style scoped>
.toast {
    position: relative;
    background: #fff;
    color: #333;
    border-left: 5px solid #999;
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: var(--box-shadow);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 240px;
    z-index: 1000;
    font-family: sans-serif;
    width: 300px;
    max-width: 300px;
}

.toast.success {
    border-left-color: #28a745;
}
.toast.error {
    border-left-color: #dc3545;
}
.toast.info {
    border-left-color: #007bff;
}

.toast.warning {
    border-left-color: #ffa000;
}
</style>
