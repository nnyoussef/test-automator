import type { FormControl, FormControlDataType, FormElementProps } from '@/components/dynamic-form';
import { getDynamicallyConfiguredFormEventsById } from '@/components/dynamic-form/common/dynamically-configured-form.events.ts';
import { onMounted, ref, useTemplateRef, watch } from 'vue';

type PropType<MODEL_TYPE> = { defaultValue: MODEL_TYPE } & FormElementProps;
type ModelType<T extends FormControlDataType> = { value: FormControl<T> };

export function useInputValidation<T extends FormControlDataType>(
    props: PropType<T>,
    model: ModelType<T>,
) {
    const formEvent = getDynamicallyConfiguredFormEventsById(props.parentId);
    model.value.data = props.defaultValue;
    const errorDialogBoxOpened = ref(false);
    const isValid = ref(false);
    const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

    const isValidFunction = () => {
        const input: HTMLInputElement = <HTMLInputElement>inputRef.value;
        return input.validity.valid || (!props.required && inputRef.value?.value === '');
    };

    const onStatusIconClicked = () => {
        if (!isValidFunction()) {
            errorDialogBoxOpened.value = true;
        }
    };

    onMounted(() => {
        const setInitialState = () => {
            isValid.value = isValidFunction();
            model.value = {
                data: props.defaultValue,
                isValid: isValid.value,
            };
        };
        setInitialState();
        formEvent?.RESET.subscribe(setInitialState);
        watch(
            () => model.value.data,
            () => {
                model.value.isValid = isValidFunction();
                isValid.value = model.value.isValid;
            },
        );
    });

    return {
        errorDialogBoxOpened,
        isValid,
        inputRef,
        onStatusIconClicked,
    };
}
