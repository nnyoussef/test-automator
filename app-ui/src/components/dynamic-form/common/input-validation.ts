import type { FormControl, FormControlDataType, FormElementProps } from '@/components/dynamic-form';
import { getDynamicallyConfiguredFormEventsById } from '@/components/dynamic-form/common/form.events.ts';
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import { useTooltip } from '@/components/dynamic-form/common/tooltip.ts';

type PropType<MODEL_TYPE> = { defaultValue: MODEL_TYPE } & FormElementProps;
type ModelType<T extends FormControlDataType> = { value: FormControl<T> };

export function useInputValidation<T extends FormControlDataType>(
    props: PropType<T>,
    model: ModelType<T>,
) {
    const errorDialogBoxOpened = ref(false);
    const isValid = ref(false);
    const inputRef = useTemplateRef<HTMLInputElement>('inputRef');
    const tooltipShow = useTooltip(props.parentId, props.name);

    const formEvent = getDynamicallyConfiguredFormEventsById(props.parentId);
    model.value.data = props.defaultValue;

    const validate = () => {
        const input: HTMLInputElement = <HTMLInputElement>inputRef.value;
        return input.validity.valid || (!props.required && inputRef.value?.value === '');
    };

    const onStatusIconClicked = () => {
        if (!validate()) {
            errorDialogBoxOpened.value = true;
        }
    };

    onMounted(() => {
        const setInitialState = () => {
            model.value.data = props.defaultValue;
            requestAnimationFrame(() => {
                isValid.value = validate();
                model.value = {
                    data: props.defaultValue,
                    isValid: isValid.value,
                    message: isValid.value ? 'Valid' : inputRef.value?.validationMessage,
                };
            });
        };
        setInitialState();
        formEvent.RESET.subscribe(setInitialState);

        watch(
            () => model.value.data,
            () => {
                const isValidNow = validate();
                model.value.isValid = isValidNow;
                model.value.message = isValidNow ? 'Valid' : inputRef.value?.validationMessage;
                isValid.value = model.value.isValid;
            },
        );
    });

    return {
        errorDialogBoxOpened,
        isValid,
        inputRef,
        onStatusIconClicked,
        tooltipShow,
    };
}
