export type EventReporterType = 'success' | 'info' | 'error' | 'warning';

export interface BaseOutputProtocole<T = EventReporterType> {
    /**
     * Reports an event to the output protocol.
     * @param message - The message to report.
     * @param eventType - The type of the event.
     * @param tag
     * */
    eventReporter(message: string, eventType: T, tag?: string): void;
}
