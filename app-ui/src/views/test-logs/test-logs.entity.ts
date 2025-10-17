import { Subscription } from 'rxjs';
import type { Optional } from '@/common/types.ts';

interface TestLogEntity {
    /**
     * The UUID of the currently selected test log.
     * This is used to identify which test log is currently being viewed or interacted with.
     */
    set selectedUuid(uuid: Optional<string>);

    /**
     * The UUID of the currently selected test log.
     * This is used to identify which test log is currently being viewed or interacted with.
     */
    get selectedUuid(): Optional<string>;

    /**
     * Subscription to the test logs listener.
     * This is used to listen for updates or changes in the test logs.
     */
    get testLogsListener(): Subscription;

    /**
     * Subscription to the test logs listener.
     * This is used to listen for updates or changes in the test logs.
     */
    set testLogsListener(subscription: Subscription);

    /**
     * Unsubscribes from the test log listener to prevent memory leaks.
     */
    unsubscribeTestLogListener(): void;
}

const createTestLogEntity: () => TestLogEntity = () => {
    let selectedUuid: Optional<string> = undefined;
    const testLogsListener: Subscription = Subscription.EMPTY;

    return {
        selectedUuid,
        testLogsListener,
        unsubscribeTestLogListener(): void {
            testLogsListener.unsubscribe();
        },
    };
};

export { createTestLogEntity, type TestLogEntity };
