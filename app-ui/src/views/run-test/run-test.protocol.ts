import type { TestMetaData } from '@/views/run-test/run-test.entity.ts';
import type { KeyValueMap } from '@/common/types';
import type { BaseOutputProtocole } from '@/common/base-output-protocole.ts';

// Protocols for the Run Test Interactor
interface RunTestInteractorInputProtocol {
    /**
     * Fetches all available tests, optionally refreshing the list.
     * @param isRefreshAction - If true, forces a refresh of the test list.
     */
    getAllTestAvailable(isRefreshAction?: boolean): void;

    /**
     * Fetches specific details for a test at the given path.
     * @param path - The path to the test.
     * @param isRefreshAction - If true, forces a refresh of the test details.
     */
    getTestSpecificDetails(path: string, isRefreshAction?: boolean): void;

    /**
     * Registers a test runner with the given name, path, and form data.
     * @param name - The name of the test runner.
     * @param path - The path to the test runner.
     * @param form - Additional form data for registration.
     */
    registerForTestRunner(name: string, path: string, form: KeyValueMap): void;

    /**
     * Refreshes the list of all available tests.
     */
    refreshAllTestAvailable(): void;

    /**
     * Refreshes the test configuration inputs for a specific path.
     * @param path - The path for which to refresh the test configuration inputs.
     */
    refreshTestsConfigsInputsForPath(path: string): void;

    /**
     *  Sets the last selected test path.
     * @param data - An object containing the name and path of the last selected test.
     */
    setLastSelectedTestPath(data: { name: string; path: string }): void;

    /**
     * Retrieves the last selected test path.
     * @returns An object containing the name and path of the last selected test, or null if none is set.
     */
    getLastSelectedTestPath(): void;
}

// Protocols for the Run Test Interactor Output
interface RunTestInteractorOutputProtocol extends BaseOutputProtocole {
    /**
     * Called when all available tests are fetched.
     * @param data - The list of available test metadata.
     */
    allTestAvailable(data: TestMetaDataViewModel[]): void;

    /**
     * Called when specific details for a test are fetched.
     * @param data - The details of the specific test.
     */
    testSpecificDetails(data: KeyValueMap): void;

    /**
     * Called when a test runner is successfully registered.
     * @param uuid - The unique identifier of the registered test runner.
     */
    registerForTestRunnerSuccess(uuid: string): void;

    /**
     * Called when there is an error registering a test runner.
     * @param error - The error message.
     */
    registerForTestRunnerFailure(): void;

    /**
     * Called when the test list is refreshed.
     * @param data - The refreshed list of test metadata.
     */
    testListRefreshed(data: TestMetaDataViewModel[]): void;

    /**
     * Called when the test configuration inputs for a specific path are refreshed.
     * @param data - The refreshed configuration inputs for the specified path.
     */
    testConfigurationForPathRefreshed(data: KeyValueMap): void;

    lastSelectedTestPathRetrieved(data: { name: string; path: string } | null): void;
}

type TestMetaDataViewModel = Readonly<TestMetaData>;

export type {
    RunTestInteractorInputProtocol,
    RunTestInteractorOutputProtocol,
    TestMetaDataViewModel,
};
