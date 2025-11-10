import { map } from 'rxjs';
import { testRunRepository } from '@/rest-client-repo/test-run-repository';
import { testInfoRepository } from '@/rest-client-repo/test-info-repository';
import { toRaw } from 'vue';
import { createRunTestEntity, type TestEntity } from './run-test.entity.ts';
import { BaseInteractor } from '@/common/base-interactor';
import type {
    RunTestInteractorInputProtocol,
    RunTestInteractorOutputProtocol,
} from '@/views/run-test/run-test.protocol.ts';
import type { KeyValueMap } from '@/common/types';

/**
 * Interactor responsible for managing test execution and related metadata.
 */
class RunTestInteractor
    extends BaseInteractor<RunTestInteractorOutputProtocol, TestEntity>
    implements RunTestInteractorInputProtocol
{
    private static readonly AVAILABLE_TESTS_KEY = 'availableTests';
    private static readonly AVAILABLE_TEST_CONFIGS_KEY = 'availableTestsConfigs';
    private static readonly LAST_SELECTED_TEST_PATH_KEY = 'lastSelectedTestPath';

    constructor() {
        super();
        this.entity = this.initEntity();
    }

    /** Fetches all available tests. */
    public getAllTestAvailable(isRefreshAction = false): void {
        if (this.entity.hasTests()) {
            this.outputProtocol.allTestAvailable(this.entity.getAvailableTests());
            return;
        }

        testInfoRepository
            .fetchAllAvailableTests(this.abortController)
            .pipe(map((response) => response.data))
            .subscribe({
                next: (tests) => {
                    this.entity.setAvailableTests(tests);
                    this.saveToGpStateStore(RunTestInteractor.AVAILABLE_TESTS_KEY, tests);

                    const action = isRefreshAction
                        ? this.outputProtocol.testListRefreshed
                        : this.outputProtocol.allTestAvailable;
                    action(this.entity.getAvailableTests());
                    this.outputProtocol.eventReporter('Test fetched successfully', 'success');
                },
                error: (error: Error) => {
                    this.outputProtocol.eventReporter(error.message, 'error');
                },
            });
    }

    /** Fetches test configuration for a given test path. */
    public getTestSpecificDetails(path: string, isRefreshAction = false): void {
        if (this.entity.hasTestConfigAt(path)) {
            const config = this.entity.getTestConfigAt(path);
            if (config) this.outputProtocol.testSpecificDetails(config);
            return;
        }

        testInfoRepository
            .fetchTestSpecificDetails(path, this.abortController)
            .pipe(map((response) => response.data))
            .subscribe({
                next: (configData) => {
                    this.entity.setTestConfigsWith(path, configData);

                    const config = this.entity.getTestConfigAt(path);
                    const action = isRefreshAction
                        ? this.outputProtocol.testConfigurationForPathRefreshed
                        : this.outputProtocol.testSpecificDetails;
                    if (config) {
                        action(config);
                        this.outputProtocol.eventReporter(
                            'Test configuration fetched successfully',
                            'success',
                        );
                    }
                },
                error: (error: Error) => this.outputProtocol.eventReporter(error.message, 'error'),
            });
    }

    /** Registers a new test run with the provided parameters. */
    public registerForTestRunner(name: string, path: string, form: KeyValueMap): void {
        if (!this.isTestRunnerParamsValid(name, path, form)) {
            this.outputProtocol.registerForTestRunnerFailure();
            return;
        }

        if (!this.getTestLogsState().canAddAnotherTestLog) {
            this.outputProtocol.registerForTestRunnerFailure();
            this.outputProtocol.eventReporter(
                'Limit reached, cannot start another test run',
                'error',
            );
            return;
        }

        const testParams = this.formatTestParams(form);
        const composedPath = this.composeTestPath(name, path);

        testRunRepository
            .registerForTestRunner({ path, testParams }, this.abortController)
            .pipe(map((response) => response.data.token))
            .subscribe({
                next: (uuid) => {
                    this.getTestLogsState().addNewTestLogStream(uuid, composedPath, form);
                    this.outputProtocol.registerForTestRunnerSuccess(uuid);
                    this.outputProtocol.eventReporter(
                        'Test run registered successfully and will be executed in background',
                        'info',
                    );
                },
                error: (error) => {
                    this.outputProtocol.registerForTestRunnerFailure();
                    this.outputProtocol.eventReporter(error.message, 'error');
                },
            });
    }

    /** Refreshes all available tests. */
    public refreshAllTestAvailable(): void {
        this.entity.reset();
        this.getAllTestAvailable(true);
    }

    /** Refreshes test configuration for a given path. */
    public refreshTestsConfigsInputsForPath(path: string): void {
        this.entity.clearTestConfigsWith(path);
        this.getTestSpecificDetails(path, true);
    }

    /** Saves the last selected test path. */
    public setLastSelectedTestPath(data: { name: string; path: string }): void {
        this.entity.setLastSelectedTestPath(data);
    }

    /** Retrieves the last selected test path. */
    public getLastSelectedTestPath(): void {
        this.outputProtocol.lastSelectedTestPathRetrieved(this.entity.getLastSelectedTestPath());
    }

    /** Cleans up persistent state and aborts any ongoing operations. */
    public destroy(): void {
        this.saveToGpStateStore(
            RunTestInteractor.AVAILABLE_TEST_CONFIGS_KEY,
            this.entity.getAvailableTestsConfigs(),
        );
        this.saveToGpStateStore(
            RunTestInteractor.LAST_SELECTED_TEST_PATH_KEY,
            this.entity.getLastSelectedTestPath(),
        );
        this.abortController.abort('Run Test View destroyed');
    }

    // --- Protected Methods ---

    protected initEntity(): TestEntity {
        const entity = createRunTestEntity();

        entity.setAvailableTests(
            this.getFromGpStateStore(RunTestInteractor.AVAILABLE_TESTS_KEY, []),
        );

        entity.setAvailableTestsConfigs(
            this.getFromGpStateStore(RunTestInteractor.AVAILABLE_TEST_CONFIGS_KEY, {}),
        );

        entity.setLastSelectedTestPath(
            this.getFromGpStateStore(RunTestInteractor.LAST_SELECTED_TEST_PATH_KEY, {
                name: '',
                path: '',
            }),
        );

        return entity;
    }

    protected getComponentName(): string {
        return 'run-test';
    }

    // --- Private Methods ---

    /** Checks whether parameters for a test runner are valid. */
    private isTestRunnerParamsValid(name: string, path: string, form: KeyValueMap): boolean {
        return !!(name && path && Object.keys(form).length);
    }

    /** Formats raw form data into test parameters. */
    private formatTestParams(form: KeyValueMap): KeyValueMap<string> {
        const params: KeyValueMap<string> = {};
        for (const [key, value] of Object.entries(form)) {
            params[key] = toRaw(toRaw(value).data);
        }
        return params;
    }

    /** Builds the full test path with the test name appended. */
    private composeTestPath(name: string, path: string): string {
        const segments = path.split(/[/\\]/);
        segments.pop();
        segments.push(name);
        return segments.join('/');
    }
}

/** Factory function to create a fully wired RunTestInteractor instance. */
export const createRunTestInputProtocol = (): RunTestInteractorInputProtocol &
    BaseInteractor<RunTestInteractorOutputProtocol, TestEntity> => new RunTestInteractor();
