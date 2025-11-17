import type { MessageLevel } from '@/common/types';
import type { Subject } from 'rxjs';
import type { InjectionKey } from 'vue';

export type AppEvents = {
    POPUP: Subject<{
        type: MessageLevel;
        message: string;
        clearAllBefore?: boolean;
    }>;
};
export const APP_EVENTS_INJECTION_KEY: InjectionKey<AppEvents> =
    Symbol() as InjectionKey<AppEvents>;
