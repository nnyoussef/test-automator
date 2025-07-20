<script setup lang="ts">
import { HtmlAttributesConstants } from '@/common/constantes/html-constants.ts';
import { ref, watch } from 'vue';
import IconButton from '@/components/interactive/IconButton.vue';
import type { FunctionMap } from '@/common/types.ts';
import type { DirStruct, FileSelectorProps } from '@/components/interactive';
import ButtonList from '@/components/interactive/ButtonList.vue';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';

const props = defineProps<FileSelectorProps>();

let selectedDirSubDir = ref<string[]>([]);
let selectedDirFiles = ref([]);
let selectedDir: any[] = [];
let dirSelectionHistory: any[] = [];
let dirSelectionHistoryCurrentDir = ref<string[]>([]);

const isBackwardIconVisisble = ref(false);
let positionOfSelectedFile = -1;
const emits = defineEmits<{
    itemSelected: any;
}>();

const onItemClickHandlers: FunctionMap<HTMLElement, void> = {
    dir(el: HTMLElement) {
        const selected = el.getAttribute(HtmlAttributesConstants.DATA_ELEMENT_VALUE);
        dirSelectionHistory.push(selectedDir);
        dirSelectionHistoryCurrentDir.value.push(selected);
        selectedDir = selectedDir.subDir[selected];
        selectedDirSubDir.value = Object.keys(selectedDir.subDir);
        selectedDirFiles.value = selectedDir.files.map((d) => ({ ...d, selected: false }));
        isBackwardIconVisisble.value = true;
    },
    file(el: HTMLElement) {
        if (selectedDirFiles.value[positionOfSelectedFile])
            selectedDirFiles.value[positionOfSelectedFile].selected = false;
        const index = Number(el.getAttribute(HtmlAttributesConstants.DATA_ELEMENT_VALUE));
        positionOfSelectedFile = index;
        selectedDirFiles.value[index].selected = true;
        emits('itemSelected', selectedDir.files[index]);
    },
    backwards() {
        dirSelectionHistoryCurrentDir.value.pop();
        const previous = dirSelectionHistory.pop();
        if (!previous) return;
        selectedDir = previous;
        selectedDirSubDir.value = Object.keys(selectedDir.subDir);
        selectedDirFiles.value = selectedDir.files.map((d) => ({ ...d, selected: false }));
        if (dirSelectionHistory.length === 0) isBackwardIconVisisble.value = false;
    },
};

const onItemClicked = (ev: MouseEvent) => {
    let el = <HTMLElement>ev.target;
    if (!el.hasAttribute(HtmlAttributesConstants.DATA_ELEMENT_ROLE)) el = el.parentElement;
    const itemName = el.getAttribute(HtmlAttributesConstants.DATA_ELEMENT_ROLE) ?? '';
    onItemClickHandlers[itemName](el);
};

const getCurrentDir = (): string => {
    if (!dirSelectionHistoryCurrentDir.value.length) return '/';
    return `/${dirSelectionHistoryCurrentDir.value.join('/')}`;
};

const onDirExplorerChanged = (event: string[]) => {
    dirSelectionHistoryCurrentDir.value = event;
};

const cleanDir = (): any => ({
    files: [],
    subDir: {},
});

let dir: DirStruct = {};

const updateDirTree = (files: Array<Readonly<{ name: string; location: string }>>) => {
    dir = {};
    dirSelectionHistory = [];
    dirSelectionHistoryCurrentDir.value = [];
    isBackwardIconVisisble.value = false;
    files?.forEach((e1) => {
        let composition = e1.location.split(/[\/\\]/);
        composition = composition.slice(1, composition.length - 1);
        let currentSubDir: DirStruct = dir;
        let currentSubDirFiles: any[] = [];
        composition.forEach((e: string, index: number) => {
            if (!currentSubDir[e]) {
                currentSubDir[e] = cleanDir();
                currentSubDirFiles = currentSubDir[e].files;
                currentSubDir = currentSubDir[e].subDir;
                return;
            }
            currentSubDirFiles = currentSubDir[e].files;
            currentSubDir = currentSubDir[e].subDir;
        });
        currentSubDirFiles.push({ name: e1.name, path: e1.location });
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
    <div @click="onItemClicked" style="margin-left: var(--element-gap)">
        <div style="cursor: pointer; margin-top: var(--element-gap); gap: 8px" class="unselectable">
            <HorizontalLayout>
                <IconButton
                    id="back_button"
                    icon="back"
                    button-role="backwards"
                    :button-text-color="isBackwardIconVisisble ? 'var(--primary-color)' : 'gray'"
                    :disabled="!isBackwardIconVisisble"
                />
                <ButtonList
                    :values="getCurrentDir()"
                    seperator="/"
                    @itemClicked="onDirExplorerChanged"
                />
            </HorizontalLayout>
        </div>
        <template v-for="item in selectedDirSubDir">
            <div
                data-role="dir"
                :data-element-value="item"
                class="flex-row-container layout-containment item"
            >
                <IconButton
                    id="folder"
                    icon="folder"
                    :button-label="item"
                    button-text-color="black"
                    icon-color="var(--primary-color)"
                    button-role="dir"
                    :button-value="item"
                    :disable-hover-css="true"
                />
            </div>
        </template>
        <div
            v-for="(item, index) in selectedDirFiles"
            :data-element-value="index"
            data-role="file"
            :data-selected="item.selected"
            :key="item.name"
            class="flex-row-container layout-containment item"
        >
            <IconButton
                id="start"
                icon="start"
                :button-label="item.name"
                button-text-color="black"
                icon-color="green"
                button-role="file"
                :button-value="index"
                :disable-hover-css="true"
            />
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
