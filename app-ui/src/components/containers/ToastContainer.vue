<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { ToastViewProps } from '@/components/containers/index.ts';
import IconButton from '@/components/interactive/IconButton.vue';

type ToastItemsType = ToastViewProps['content'] & { id: number; timeStamp?: number };

const props = withDefaults(defineProps<ToastViewProps>(), {
    duration: 5000,
    limit: 5,
});

let toastId = 0;
const items = ref<ToastItemsType[]>([]);
let toastRemovalWatchIsActive = false;

onMounted(() => {
    watch(
        () => props.content,
        (newVal) => {
            requestIdleCallback(() => {
                const { value: list } = items;

                if (!newVal) return;
                const item = { ...newVal, id: toastId++ } as ToastItemsType;
                item.timeStamp = Date.now();
                // Add new item
                list.push(item);

                if (!toastRemovalWatchIsActive) {
                    toastRemovalWatchIsActive = true;
                    toastRemovalWatch(props.duration);
                }
            });
        },
    );
    const toastRemovalWatch = (duration: number) => {
        setTimeout(() => {
            requestIdleCallback(() => {
                if (items.value.length > 0) {
                    let remainingTime = calculateToastRemainingTime(items.value[0]);

                    if (remainingTime <= 0) {
                        items.value.shift();
                        remainingTime = calculateToastRemainingTime(items.value[0]);
                    }
                    toastRemovalWatch(remainingTime);
                }
                toastRemovalWatchIsActive = false;
            });
        }, duration);
    };

    const calculateToastRemainingTime = (item?: ToastItemsType) => {
        return item?.timeStamp ? props.duration - (Date.now() - item.timeStamp) : props.duration;
    };
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
