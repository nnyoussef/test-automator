import { Subject } from 'rxjs';
import { inject, provide } from 'vue';
import type { DynamicallyConfiguredFormEvents } from '@/components/dynamic-form';

function createDynamicallyConfiguredFormEvents(id: string) {
    const events: DynamicallyConfiguredFormEvents = {
        RESET: new Subject(),
        TOOLTIP_CLICKED: new Subject<string | undefined>(),
    };
    provide(id, events);
    return events;
}

function getDynamicallyConfiguredFormEventsById(id: string) {
    return <DynamicallyConfiguredFormEvents>inject(id);
}

function destroyDynamicallyConfiguredFormEvents(id: string) {
    const events = getDynamicallyConfiguredFormEventsById(id);
    if (events) {
        Object.values(events).forEach((sub: Subject<any>) => {
            sub.unsubscribe();
        });
    }
}

export {
    createDynamicallyConfiguredFormEvents,
    getDynamicallyConfiguredFormEventsById,
    destroyDynamicallyConfiguredFormEvents,
    type DynamicallyConfiguredFormEvents,
};
