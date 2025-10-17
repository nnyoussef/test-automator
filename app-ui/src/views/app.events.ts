import { Subject } from 'rxjs';
import type { InjectionKey } from 'vue';

export type AppEvents = {
    RUN_TEST: Subject<string>;
    POPUP: Subject<{ type: 'info' | 'warning' | 'error' | 'success'; message: string }>;
};

export const AppEventsInjectionKey: InjectionKey<AppEvents> = Symbol() as InjectionKey<AppEvents>;

export enum AppEventSourceEnum {
    TEST_END,
    HTML_REPORT,
}

export type AppEventSourceType = keyof typeof AppEventSourceEnum;
