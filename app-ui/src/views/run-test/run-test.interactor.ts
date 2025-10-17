import { map } from 'rxjs';
import { testRunRepository } from '@/rest-client-repo/test-run-repository';
import { toRaw } from 'vue';
import { createRunTestEntity, type TestEntity } from './run-test.entity.ts';
import { BaseInteractor } from '@/common/base-interactor';
import { testInfoRepository } from '@/rest-client-repo/test-info-repository';
import {
    type RunTestInteractorInputProtocol,
    type RunTestInteractorOutputProtocol,
} from '@/views/run-test/run-test.protocol.ts';
import type { KeyValueMap } from '@/common/types';

/**
 * Interactor for test management.
 */
class RunTestInteractor
    extends BaseInteractor<RunTestInteractorOutputProtocol, TestEntity>
    implements RunTestInteractorInputProtocol
{
    private static readonly AVAILABLE_TEST = 'availableTests';
    private static readonly AVAILABLE_TEST_CONFIGS = 'availableTestsConfigs';

    constructor() {
        super();
        this.entity = this.initEntity();
    }

    // --- Public Methods ---

    /** Gets all available tests. */
    public getAllTestAvailable(isRefreshAction: boolean = false): void {
        if (this.entity.hasTests()) {
            this.outputProtocol.allTestAvailable(this.entity.getAvailableTests());
            return;
        }
        testInfoRepository
            .fetchAllAvailableTests(this.abortController)
            .pipe(map((s) => s.data))
            .subscribe({
                next: (data) => {
                    this.entity.setAvailableTests(data);
                    this.saveToGpStateStore(RunTestInteractor.AVAILABLE_TEST, data);
                    const action = isRefreshAction
                        ? this.outputProtocol.testListRefreshed
                        : this.outputProtocol.allTestAvailable;
                    action(this.entity.getAvailableTests());
                },
                error: this.outputProtocol.externalCallError,
            });
    }

    /** Gets specific details for a test. */
    public getTestSpecificDetails(path: string, isRefreshAction: boolean = false): void {
        if (this.entity.hasTestConfigAt(path)) {
            const config = this.entity.getTestConfigAt(path);
            this.outputProtocol?.testSpecificDetails(config);
            return;
        }
        testInfoRepository
            .fetchTestSpecificDetails(path, this.abortController)
            .pipe(map((response) => response.data))
            .subscribe({
                next: (data) => {
                    this.entity.setTestConfigsWith(path, data);
                    const config = this.entity.getTestConfigAt(path);
                    const action = isRefreshAction
                        ? this.outputProtocol.testConfigurationForPathRefreshed
                        : this.outputProtocol.testSpecificDetails;
                    if (config) {
                        action(config);
                    }
                },
                error: this.outputProtocol.externalCallError,
            });
    }

    /** Registers for a test runner. */
    public registerForTestRunner(name: string, path: string, form: KeyValueMap): void {
        const pathComposition = path.split(/[/\\]/);
        pathComposition.pop();
        pathComposition.push(name);

        if (!this.isTestRunnerParamsValid(name, path, form)) {
            this.outputProtocol.registerForTestRunnerFailure('Invalid parameters');
            return;
        }

        if (!this.getTestLogsState().canAddAnotherTestLog) {
            this.outputProtocol.registerForTestRunnerFailure(
                'Limit reached, cannot start another test',
            );
            return;
        }
        const testParams = this.runTestDataFormatter(form);
        testRunRepository
            .registerForTestRunner({ path, testParams }, this.abortController)
            .pipe(map((data) => data.data.token))
            .subscribe({
                next: (uuid) => {
                    this.getTestLogsState().addNewTestLogStream(
                        uuid,
                        pathComposition.join('/'),
                        form,
                    );
                    this.outputProtocol?.registerForTestRunnerSuccess(uuid);
                },
                error: (err) => {
                    this.outputProtocol?.registerForTestRunnerFailure(
                        err?.message ?? 'Error while registering test runner',
                    );
                },
            });
    }

    /** Refreshes all available tests. */
    public refreshAllTestAvailable(): void {
        this.entity.reset();
        this.getAllTestAvailable(true);
    }

    /** Refreshes test configs for a given path. */
    public refreshTestsConfigsInputsForPath(path: string): void {
        this.entity.clearTestConfigsWith(path);
        this.getTestSpecificDetails(path, true);
    }

    /** Cleans up state and aborts ongoing calls. */
    public destroy(): void {
        this.saveToGpStateStore(
            RunTestInteractor.AVAILABLE_TEST_CONFIGS,
            this.entity.getAvailableTestsConfigs(),
        );
        this.abortController.abort('Run Test View destroyed');
    }

    // --- Protected Methods ---

    /** Initializes the test entity. */
    protected initEntity(): TestEntity {
        const entity = createRunTestEntity();
        entity.setAvailableTests(this.getFromGpStateStore(RunTestInteractor.AVAILABLE_TEST, []));
        entity.setAvailableTestsConfigs(
            this.getFromGpStateStore(RunTestInteractor.AVAILABLE_TEST_CONFIGS, {}),
        );
        return entity;
    }

    protected getComponentName(): string {
        return 'run-test';
    }

    // --- Private Methods ---

    /** Validates test runner parameters. */
    private isTestRunnerParamsValid(name: string, path: string, form: KeyValueMap): boolean {
        return Boolean(name && path && form);
    }

    /** Formats test data. */
    private runTestDataFormatter(form: KeyValueMap): KeyValueMap<string> {
        const testParams: KeyValueMap<string> = {};
        Object.entries(form).forEach(([key, value]) => {
            const data = toRaw(toRaw(value).data);
            testParams[key] = String(data);
        });
        return testParams;
    }
}

export const createRunTestInputProtocol: () => RunTestInteractorInputProtocol &
    BaseInteractor<RunTestInteractorOutputProtocol, TestEntity> = () => new RunTestInteractor();
