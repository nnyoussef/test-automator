import type { MessageLevel } from '@/common/types';
import type { Subject } from 'rxjs';
import type { InjectionKey } from 'vue';

export type AppEvents = {
    RUN_TEST: Subject<string>;
    POPUP: Subject<{
        type: MessageLevel;
        message: string;
        clearAllBefore?: boolean;
    }>;
};
export const APP_EVENTS_INJECTION_KEY: InjectionKey<AppEvents> =
    Symbol() as InjectionKey<AppEvents>;

export enum AppEventSourceEnum {
    TEST_END,
    HTML_REPORT,
    PROGRESS_EVENT_MESSAGE,
    PROGRESS_EVENT_PERCENTAGE,
}

export type AppEventSourceType = keyof typeof AppEventSourceEnum;
