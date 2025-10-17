<script setup lang="ts" generic="T">
import { noop } from 'rxjs';
import { HtmlAttributesConstants } from '@/common/constantes/html-constants.ts';
import { ref } from 'vue';
import type { SelectableItemsTableProps } from '@/components/interactive/index.ts';

const props = withDefaults(defineProps<SelectableItemsTableProps<T>>(), {
    rowValue: (arg) => arg,
    rowLabel: (arg) => arg,
    disableSelectRow: false,
});

const emits = defineEmits<{
    onSelected: [{ value: string; label: string }];
}>();
let selectedElement: HTMLElement | undefined = undefined;
let createdElements = ref([]);
const onItemClicked = (mv: MouseEvent) => {
    const el: HTMLElement = <HTMLElement>mv.target;
    if (el.hasAttribute(HtmlAttributesConstants.DATA_ELEMENT_VALUE)) {
        const value = el.getAttribute(HtmlAttributesConstants.DATA_ELEMENT_VALUE) ?? '';
        const position = Number(el.getAttribute(HtmlAttributesConstants.DATA_POSITION));
        emits('onSelected', { value: value, label: props.rowLabel(props.items[position]) });
        let tr: HTMLElement = el;
        if (tr.tagName === 'TD') {
            tr = <HTMLElement>tr.parentElement;
        }

        if (selectedElement === undefined) {
            selectedElement = createdElements.value.find(
                (e: HTMLElement) =>
                    e.getAttribute(HtmlAttributesConstants.DATA_SELECTED) === 'true',
            );
        }
        selectedElement?.setAttribute(HtmlAttributesConstants.DATA_SELECTED, 'false');
        tr.setAttribute(HtmlAttributesConstants.DATA_SELECTED, 'true');
        selectedElement = tr;
    }
};
</script>
<template>
    <table class="data-table">
        <thead>
            <tr>
                <th v-for="name in columnName">
                    {{ name }}
                </th>
                <th></th>
            </tr>
        </thead>
        <tbody @click="disableSelectRow ? noop() : onItemClicked($event)">
            <tr
                v-for="(item, index) in items"
                ref="createdElements"
                :key="rowValue(item)"
                :data-element-value="rowValue(item)"
                :data-selected="rowValue(item) === selectedValue && !disableSelectRow"
                :data-position="index"
            >
                <td
                    v-for="col in itemToRowMapper(item)"
                    :data-position="index"
                    :data-element-value="rowValue(item)"
                >
                    {{ col }}
                </td>
            </tr>
        </tbody>
    </table>
</template>
<style scoped>
.data-table {
    border-collapse: separate;
    border-spacing: 0;

    & thead > tr {
        position: sticky;
        top: 0;
        z-index: 100;
        background: white;
    }

    & th {
        text-align: left;
        border-bottom: 1px solid black;
        padding: var(--element-gap);
    }

    & td {
        text-align: left;
        padding: var(--element-gap);
        cursor: pointer;
    }

    & tr:hover > td,
    & tr[data-selected='true'] {
        background: rgba(128, 128, 128, 0.2);
        transition: background 100ms ease-in-out;
    }
}
</style>
