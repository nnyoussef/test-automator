import { Subject } from 'rxjs';
import type { InjectionKey } from 'vue';

export type AppEvents = {
    RUN_TEST: Subject<string>;
    POPUP_OK: Subject<string>;
    POPUP_KO: Subject<{ err: unknown; instance: any; info: string } | string>;
};

export const AppEventsInjectionKey: InjectionKey<AppEvents> = Symbol() as InjectionKey<AppEvents>;

export const appEvents: AppEvents = {
    RUN_TEST: new Subject<string>(),
    POPUP_OK: new Subject(),
    POPUP_KO: new Subject(),
};

export enum AppEventSourceEnum {
    SCENARIO,
    STEP_SUCCESSFUL,
    STEP_SUCCESSFUL_RESULTS,
    STEP_ERROR,
    STEP_ERROR_DETAILS,
    TEST_END,
    COMMENT,
}

export type AppEventSourceType = keyof typeof AppEventSourceEnum;
