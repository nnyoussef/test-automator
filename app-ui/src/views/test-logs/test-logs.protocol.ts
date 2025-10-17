/**
 * This file defines the protocols for the Test Logs feature, including input and output interfaces
 * */
import type { TestLogsEvent } from '@/views/test-logs/test-logs.interactor.ts';
import type { TestLogRecord } from '@/stores';
import type { KeyValueMap } from '@/common/types';

/**
 * This interface defines the input methods for the Test Logs feature
 */
interface TestLogsInputProtocol {
    /**
     * Starts listening to test logs with an optional pre-processing function.
     * @param preProcessing - A function to execute before starting to listen.
     * @param uuid - Optional UUID to filter logs.
     */
    startListeningToTestLogs(preProcessing: () => void, uuid?: string): void;

    /**
     * Checks if the stream is from the server based on the provided UUID.
     * @param uuid - The UUID is to check.
     */
    checkIfStreamIsFromServer(uuid: string): void;

    /**
     * Stops listening to test logs.
     */
    stopListeningToTestLogs(): void;

    /**
     * Fetches test logs by UUID.
     * @param uuid - The UUID of the test log to fetch.
     */
    fetchTestLogsByUuid(uuid: string): void;

    /**
     * Fetches the history of test logs.
     */
    fetchTestLogsHistory(): void;

    /**
     * Fetches parameters for a specific test log by UUID.
     * @param uuid - The UUID of the test log to fetch parameters for.
     */
    fetchTestLogParams(uuid: string): void;

    /**
     * Fetches the currently selected UUID.
     */
    fetchSelectedUuid(): void;

    /**
     * Sets the UUID as selected for further operations.
     * @param selectedTestUuid - The UUID to set as selected.
     */
    setUuidAsSelected(selectedTestUuid: string): void;
}

/**
 * This interface defines the output methods for the Test Logs feature<
 */
interface TestLogsOutputProtocol {
    /**
     * Called when test logs are received.
     * @param events - The events received from the test logs.
     */
    onTestLogStreamReceived(events: TestLogsEventsViewModel): void;

    /**
     * Called when the stream source is checked.
     * @param isStreamFromServer - Indicates if the stream is from the server.
     */
    onStreamSourceChecked(isStreamFromServer: boolean): void;

    /**
     * Called when UUID fetches test logs.
     * @param testLogProperties - The properties of the fetched test log.
     */
    onTestLogFetched(testLogProperties: TestLogPropertiesViewModel): void;

    /**
     * Called when the test logs history is fetched.
     * @param data - The history of test logs.
     */
    onTestLogsHistoryFetched(data: TestLogHistoryViewModel[]): void;

    /**
     * Called when parameters for a test log are fetched.
     * @param data - The parameters of the fetched test log.
     */
    onTestLogParamsFetched(data?: KeyValueMap): void;

    /**
     * Called when the currently selected UUID is fetched.
     * @param uuid - The currently selected UUID.
     */
    onSelectedUuidFetched(uuid: string): void;

    /**
     * Reports an error that occurred during the test logs operations.
     * @param error - The error to report.
     */
    reportError(error: unknown): void;
}

// ViewModel types for the Test Logs feature
type TestLogHistoryViewModel = Readonly<{
    label: string;
    creationDate: string;
    value: string;
}>;

type TestLogPropertiesViewModel = Readonly<TestLogRecord>;
type TestLogsEventsViewModel = Readonly<TestLogsEvent[]>;

export type {
    TestLogsInputProtocol,
    TestLogsOutputProtocol,
    TestLogHistoryViewModel,
    TestLogPropertiesViewModel,
    TestLogsEventsViewModel,
};
