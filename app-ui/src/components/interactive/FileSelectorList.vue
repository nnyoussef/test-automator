<script setup lang="ts">
import { ref, watch } from 'vue';
import IconButton from '@/components/interactive/IconButton.vue';
import type { DirStruct, FileSelectorProps } from '@/components/interactive';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import BreadCrumb from '@/components/interactive/BreadCrumb.vue';
import VerticalLayout from '@/components/layouts/VerticalLayout.vue';
import type { FunctionMap } from '@/common/types.ts';

const props = defineProps<FileSelectorProps>();

let selectedDirSubDir = ref<string[]>([]);
let selectedDirFiles = ref([]);
let dirSelectionHistoryCurrentDir = ref<string[]>([]);
const isBackwardIconVisisble = ref(false);

let selectedDir: DirStruct = {};
let dirSelectionHistory: DirStruct[] = [];
let positionOfSelectedFile = -1;

const emits = defineEmits<{
    itemSelected: any;
}>();

const onItemClickHandlers: FunctionMap<string, void> = {
    dir(clickedFolderName: string) {
        dirSelectionHistory.push(selectedDir);
        dirSelectionHistoryCurrentDir.value.push(clickedFolderName);
        selectedDir = selectedDir.subDir[clickedFolderName];
        selectedDirSubDir.value = Object.keys(selectedDir.subDir);
        selectedDirFiles.value = selectedDir.files.map((d) => ({ ...d, selected: false }));
        isBackwardIconVisisble.value = true;
    },
    file(clickedFilePosition: string) {
        const indexOfclickedFilePosition = +clickedFilePosition!;
        if (selectedDirFiles.value[positionOfSelectedFile]) {
            selectedDirFiles.value[positionOfSelectedFile].selected = false;
        }
        positionOfSelectedFile = indexOfclickedFilePosition;
        selectedDirFiles.value[indexOfclickedFilePosition].selected = true;
        emits('itemSelected', selectedDir.files[indexOfclickedFilePosition]);
    },
};

const onItemClicked = (ev: MouseEvent) => {
    const el = ev.target as HTMLElement;

    const role = el.dataset.role || el.parentElement?.dataset.role;
    const elementValue = el.dataset.elementValue || el.parentElement?.dataset.elementValue;

    if (role && elementValue) {
        onItemClickHandlers[role]?.(elementValue);
    }
};

const getCurrentDirBreadCrumbProps = (): any[] => {
    const breadCrumbItems = dirSelectionHistoryCurrentDir.value.map((d, index) => ({
        label: d,
        value: dirSelectionHistoryCurrentDir.value.slice(0, index + 1).join('/'),
    }));
    return [{ label: '', value: '', iconName: 'home' }, ...breadCrumbItems];
};

const onDirExplorerChanged = (event: string) => {
    const breadCrumbSelectedPathDepth = (event ? event.split('/') : []).length;
    const backwardCount = dirSelectionHistoryCurrentDir.value.length - breadCrumbSelectedPathDepth;
    if (backwardCount <= 0) return;
    requestIdleCallback(() => backwards(backwardCount));
};

const cleanDir = (): any => ({
    files: [],
    subDir: {},
});

const backwards = (count: number) => {
    let previous;
    for (let i = 0; i < count; i++) {
        dirSelectionHistoryCurrentDir.value.pop();
        previous = dirSelectionHistory.pop();
    }
    if (!previous) return;
    selectedDir = previous;
    selectedDirSubDir.value = Object.keys(selectedDir.subDir);
    selectedDirFiles.value = selectedDir.files.map((d) => ({ ...d, selected: false }));
    if (dirSelectionHistory.length === 0) isBackwardIconVisisble.value = false;
};

let dir: DirStruct = {};

const updateDirTree = (files: Array<Readonly<{ name: string; location: string }>>) => {
    dir = {};
    dirSelectionHistory = [];
    dirSelectionHistoryCurrentDir.value = [];
    isBackwardIconVisisble.value = false;
    files?.forEach(({ name, location }) => {
        const parts = location.split(/[\/\\]/).slice(1, -1);
        let subDir: DirStruct = dir;
        let subDirFiles: any[] = [];

        for (const p of parts) {
            if (!subDir[p]) subDir[p] = cleanDir();
            subDirFiles = subDir[p].files;
            subDir = subDir[p].subDir;
        }
        subDirFiles.push({ name, path: location });
    });

    const rootDir = Object.keys(dir)[0];
    selectedDir = dir[rootDir];
    selectedDirSubDir.value = Object.keys(selectedDir.subDir);
    selectedDirFiles.value = selectedDir.files.map((d: any) => ({ ...d, selected: false }));
};

watch(
    () => props.files,
    (value) => updateDirTree(value),
);
</script>
<template>
    <div style="margin-left: var(--element-gap)">
        <div style="cursor: pointer; margin-top: var(--element-gap); gap: 8px" class="unselectable">
            <HorizontalLayout>
                <IconButton
                    id="back_button"
                    icon="back"
                    button-role="backwards"
                    @click="backwards(1)"
                    :button-text-color="isBackwardIconVisisble ? 'var(--primary-color)' : 'gray'"
                    :disabled="!isBackwardIconVisisble"
                />
                <BreadCrumb
                    :items="getCurrentDirBreadCrumbProps()"
                    @onItemClicked="onDirExplorerChanged"
                />
            </HorizontalLayout>
        </div>
        <div style="display: contents" @click="onItemClicked">
            <VerticalLayout style="gap: var(--element-gap)">
                <IconButton
                    v-for="item in selectedDirSubDir"
                    id="folder"
                    icon="folder"
                    :button-label="item"
                    button-text-color="black"
                    icon-color="var(--primary-color)"
                    button-role="dir"
                    :button-value="item"
                    :disable-hover-css="true"
                    class="unselectable item"
                />
            </VerticalLayout>
            <VerticalLayout>
                <IconButton
                    v-for="(item, index) in selectedDirFiles"
                    :key="item.name"
                    :data-selected="item.selected"
                    id="start"
                    icon="start"
                    class="unselectable item"
                    :button-label="item.name"
                    button-text-color="black"
                    icon-color="green"
                    button-role="file"
                    :button-value="index"
                    :disable-hover-css="true"
                />
            </VerticalLayout>
        </div>
    </div>
</template>
<style scoped>
.item {
    cursor: pointer;
    align-items: center;
    transition: background 100ms ease-out;
    gap: 8px;
    margin-top: var(--element-gap);
    height: 35px;

    &:hover {
        background: rgba(128, 128, 128, 0.2);
    }
}

.item[data-selected='true'] {
    background: rgba(128, 128, 128, 0.2);
    transition: background 100ms ease-out;
}
</style>
