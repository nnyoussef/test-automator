import type { CommonComponentAttribute } from '@/common/types.ts';

type IconButtonProps = {
    icon: string;
    iconClassName?: string;
    iconSize?: string;
    buttonId?: string;
    buttonLabel?: string;
    isDarkTheme?: boolean;
    buttonTextColor?: string;
    iconColor?: string;
    animationName?: string;
    animationInProgress?: boolean;
    disabled?: boolean;
    disableHoverCss?: boolean;
    tooltipShow?: boolean;
    tooltipContent?: string;
} & CommonComponentAttribute;

interface FileSelectorProps {
    files: Readonly<Array<Readonly<FileProps>>>;
    selectPath?: string;
}

type FileProps = {
    directory: string;
    name: string;
    path: string;
    selected: boolean;
};

interface DirStruct {
    currentWorkingDirectoryPath: string;
    currentWorkingDirectoryName?: string;
    files: FileProps[];
    subDir: Record<string, DirStruct>;
    parentDir?: DirStruct;
}

interface SelectableItemsTableProps<T> {
    itemToRowMapper: Function;
    rowValue?: Function;
    rowLabel?: Function;
    items: T[];
    columnName: string[];
    selectedValue: string;
    disableSelectRow?: boolean;
}

interface BreadCrumbProps extends CommonComponentAttribute {
    items: Array<{ label: string; value: string; iconName?: string; iconColor?: string }>;
    itemsSeperator?: string;
}

export type {
    IconButtonProps,
    FileSelectorProps,
    DirStruct,
    SelectableItemsTableProps,
    BreadCrumbProps,
    FileProps,
};
