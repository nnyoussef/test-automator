import type { AsyncComponentLoader } from '@vue/runtime-core';
import type { CommonComponentAttribute } from '@/common/types.ts';

interface ChipViewProps extends CommonComponentAttribute {
    text: string;
    textColor?: string;
    enableCloseButton?: boolean;
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

interface WebViewerProps {
    fileUrl: string;
    title?: string;
}

interface ToastViewProps {
    to: string;
    duration?: number;
    limit?: number;
    content: {
        message: string;
        type: NoteCardViewProps['type'];
    };
}

export type {
    ChipViewProps,
    LazyRendererableProps,
    DialogBoxWithDynamicContentProps,
    NoteCardViewProps,
    TooltipViewProps,
    ToastViewProps,
};
