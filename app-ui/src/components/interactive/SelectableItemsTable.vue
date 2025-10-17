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
    const label = el.dataset.value;
    if (label) {
        const value = label;
        const position = +(el.dataset.tag ?? -1);
        emits('onSelected', { value: value, label: props.rowLabel(props.items[position]) });
        let tr: HTMLElement = el;
        if (tr.tagName === 'TD') {
            tr = <HTMLElement>tr.parentElement;
        }

        if (!selectedElement) {
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
                :data-value="rowValue(item)"
                :data-selected="rowValue(item) === selectedValue && !disableSelectRow"
                :data-tag="index"
            >
                <td
                    v-for="col in itemToRowMapper(item)"
                    :data-tag="index"
                    :data-value="rowValue(item)"
                >
                    {{ col }}
                </td>
            </tr>
        </tbody>
    </table>
</template>
<style src="@/assets/styles/component/data-table.css" scoped />
