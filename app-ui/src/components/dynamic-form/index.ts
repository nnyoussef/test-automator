import type { ReadonlyKeyValueMap, SingleOrArray, TextOrNumber } from '@/common/types';
import { Subject } from 'rxjs';
import { type Component, defineAsyncComponent } from 'vue';

type InputType = 'text' | 'number' | 'select' | 'file' | 'temporal';
type FormControlDataType = SingleOrArray<TextOrNumber> | SingleOrArray<Date> | File;

interface FormElementProps {
    parentId: string;
    name: string;
    required: boolean;
    placeHolder?: string;
    label: string;
    type: InputType;
    description: string;
}

interface TextFieldProps extends FormElementProps {
    maxLength: number;
    minLength: number;
    pattern: string;
    defaultValue: string;
    autoComplete?: boolean;
}

interface NumberFieldProps extends FormElementProps {
    minValue: number;
    maxValue: number;
    step: number;
    defaultValue: number;
    autoComplete?: boolean;
}

interface SelectFieldProps extends FormElementProps {
    maxSelections?: number;
    minSelection?: number;
    options: string[];
    defaultValue: string[];
}

interface FileSelectFieldProps extends FormElementProps {
    maxSize: number;
}

interface TemporalFieldProps extends FormElementProps {
    min: number;
    max: number;
    defaultValue: Date;
    step: number;
    format: 'date' | 'datetime-local' | 'week' | 'month' | 'time';
}

type FormInput =
    | TextFieldProps
    | NumberFieldProps
    | SelectFieldProps
    | FileSelectFieldProps
    | { name: string };

type FormConfigurations = ReadonlyKeyValueMap<FormInput>;

type DynamicallyConfiguredFormEvents = {
    RESET: Subject<void>;
    TOOLTIP_CLICKED: Subject<string | undefined>;
};

interface FormControl<T extends FormControlDataType> {
    isValid: boolean;
    data: T;
    message?: string;
}

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
