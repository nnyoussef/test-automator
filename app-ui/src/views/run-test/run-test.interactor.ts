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

class RunTestInteractor
    extends BaseInteractor<RunTestInteractorOutputProtocol, TestEntity>
    implements RunTestInteractorInputProtocol
{
    private static readonly AVAILABLE_TEST: string = 'availableTests';
    private static readonly AVAILABLE_TEST_CONFIGS: string = 'availableTestsConfigs';

    constructor() {
        super();
        this.entity = this.initEntity();
    }

    public getAllTestAvailable(isRefreshAction: boolean = false): void {
        if (this.entity.hasTests()) {
            this.outputProtocol?.allTestAvailable(this.entity.getAvailableTests());
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

    public getTestSpecificDetails(path: string, isRefreshAction: boolean = false): void {
        if (this.entity.hasTestConfigAt(path)) {
            this.outputProtocol?.testSpecificDetails(this.entity.getTestConfigAt(path));
            return;
        }
        testInfoRepository
            .fetchTestSpecificDetails(path, this.abortController)
            .pipe(map((response) => response.data))
            .subscribe({
                next: (data) => {
                    this.entity.setTestConfigsWith(path, data);
                    const action = isRefreshAction
                        ? this.outputProtocol.testConfigurationForPathRefreshed
                        : this.outputProtocol.testSpecificDetails;
                    action(this.entity.getTestConfigAt(path));
                },
                error: this.outputProtocol.externalCallError,
            });
    }

    public registerForTestRunner(name: string, path: string, form: KeyValueMap): void {
        const pathComposition = path.split(/[/\\]/);
        pathComposition.pop();
        pathComposition.push(name);

        if (!name || !path || !form) {
            this.outputProtocol.registerForTestRunnerFailure('Invalid parameters');
            return;
        }

        if (!this.getTestLogsState().canAddAnotherTestLog) {
            this.outputProtocol.registerForTestRunnerFailure('cannot run test');
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
                        err?.message ?? 'Error registering for test runner',
                    );
                },
            });
    }

    public refreshAllTestAvailable(): void {
        this.entity.reset();
        this.getAllTestAvailable(true);
    }

    public refreshTestsConfigsInputsForPath(path: string) {
        this.entity.clearTestConfigsWith(path);
        this.getTestSpecificDetails(path, true);
    }

    public destroy() {
        this.saveToGpStateStore(
            RunTestInteractor.AVAILABLE_TEST_CONFIGS,
            this.entity.getAvailableTestsConfigs(),
        );
        this.abortController.abort('Run Test View destroyed');
    }

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

    private runTestDataFormatter(form: any): KeyValueMap<string> {
        const testParams: KeyValueMap<string> = {};
        Object.entries(form).forEach((d: any) => {
            const data = toRaw(toRaw(d[1]).data);
            testParams[d[0]] = String(data);
        });
        return testParams;
    }
}

export const createRunTestInputProtocol: () => RunTestInteractorInputProtocol &
    BaseInteractor<RunTestInteractorOutputProtocol, TestEntity> = () => new RunTestInteractor();
