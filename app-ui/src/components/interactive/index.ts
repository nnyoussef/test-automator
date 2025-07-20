import type { KeyValueMap, SingleOrArray, TextOrNumber } from '@/common/types.ts';

type IconButtonProps = {
    icon: string;
    iconClassName?: string;
    iconSize?: string;
    buttonId?: string;
    buttonLabel?: string;
    isDarkTheme?: boolean;
    buttonTextColor: string;
    iconColor?: string;
    animationName?: string;
    animationInProgress?: boolean;
    disabled?: boolean;
    buttonRole?: string;
    buttonValue?: TextOrNumber;
    disableHoverCss?: boolean;
};

type FileSelectorProps = {
    files: Array<Readonly<{ name: string; location: string }>>;
    highlightAtLocation?: string;
};

type DirStruct = KeyValueMap<{
    files: { name: string; path: string }[];
    subDir: DirStruct;
}>;

type SelectableItemsTableProps<T> = {
    itemToRowMapper: Function;
    rowValue?: Function;
    rowLabel?: Function;
    items: T[];
    columnName: string[];
    selectedValue: string;
    disableSelectRow?: boolean;
};

type ButtonListProps = {
    values: SingleOrArray<string>;
    seperator?: string;
    role?: string;
};

export type {
    IconButtonProps,
    FileSelectorProps,
    DirStruct,
    SelectableItemsTableProps,
    ButtonListProps,
};
