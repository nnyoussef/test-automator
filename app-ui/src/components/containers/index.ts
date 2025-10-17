import type { AsyncComponentLoader } from '@vue/runtime-core';

interface ChipViewProps {
    text: string;
    textColor?: string;
}

interface LazyRendererableProps {
    render: boolean;
    asyncRenderFunction?: AsyncComponentLoader;
    asyncComponentData?: any;
}

interface DialogBoxWithDynamicContentProps {
    title: string;
}

interface NoteCardViewProps {
    note?: string;
    type: 'info' | 'warning' | 'error' | 'success';
    noteClass?: string;
}

interface TooltipViewProps {
    anchorName: string;
    tooltipShow: boolean;
}

export type {
    ChipViewProps,
    LazyRendererableProps,
    DialogBoxWithDynamicContentProps,
    NoteCardViewProps,
    TooltipViewProps,
};
