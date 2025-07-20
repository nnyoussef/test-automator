import type { ReadonlyKeyValueMap, SingleOrArray, TextOrNumber } from '@/common/types';
import { Subject } from 'rxjs';
import { type Component, defineAsyncComponent } from 'vue';

type InputType = 'text' | 'number' | 'select' | 'file' | 'temporal';
type FormControlDataType = SingleOrArray<TextOrNumber> | SingleOrArray<Date> | File;

type TextFieldProps = {
    maxLength: number;
    minLength: number;
    pattern: string;
    defaultValue: string;
    autoComplete?: boolean;
} & FormElementProps;

type NumberFieldProps = {
    minValue: number;
    maxValue: number;
    step: number;
    defaultValue: number;
    autoComplete?: boolean;
} & FormElementProps;

type SelectFieldProps = {
    maxSelections?: number;
    minSelection?: number;
    options: string[];
    defaultValue: string[];
} & FormElementProps;

type FormElementProps = {
    parentId: string;
    name: string;
    required: boolean;
    placeHolder: string;
    label: string;
    type: InputType;
};

type FileSelectFieldProps = {
    maxSize: number;
    description: string;
} & FormElementProps;

type TemporalFieldProps = {
    min: number;
    max: number;
    defaultValue: Date;
    step: number;
    format: 'date' | 'datetime-local' | 'week' | 'month' | 'time';
} & FormElementProps;

type FormInput =
    | TextFieldProps
    | NumberFieldProps
    | SelectFieldProps
    | FileSelectFieldProps
    | { name: string };

type FormConfigurations = ReadonlyKeyValueMap<FormInput>;

interface DynamicallyConfiguredFormEvents {
    RESET: Subject<void>;
}

type FormControl<T extends FormControlDataType> = {
    isValid: boolean;
    data: T;
};

type FormGroup<T extends FormControlDataType> = ReadonlyKeyValueMap<FormControl<T>>;

const formComponentsLookup: ReadonlyKeyValueMap<Component> = {
    text: defineAsyncComponent(() => import('./TextField.vue')),
    number: defineAsyncComponent(() => import('./NumberField.vue')),
    select: defineAsyncComponent(() => import('./SelectField.vue')),
    //file: defineAsyncComponent(() => import('./FileUploadField.vue')),
    field_not_implemented: defineAsyncComponent(() => import('./FieldTypeNotImplemented.vue')),
    temporal: defineAsyncComponent(() => import('./TemporalField.vue')),
};

type DynamicallyConfiguredFormProps = {
    formConfiguration: FormConfigurations;
    disableSubmitButton: boolean;
    formId: string;
};

export { formComponentsLookup };

export type {
    FormGroup,
    DynamicallyConfiguredFormProps,
    FormElementProps,
    TextFieldProps,
    NumberFieldProps,
    SelectFieldProps,
    FileSelectFieldProps,
    FormInput,
    FormConfigurations,
    DynamicallyConfiguredFormEvents,
    FormControl,
    FormControlDataType,
    TemporalFieldProps,
};
