import { createTestLogEntity, type TestLogEntity } from '@/views/test-logs/test-logs.entity.ts';
import { bufferCount } from 'rxjs';
import { BaseInteractor } from '@/common/base-interactor';
import type { AppEventSourceType } from '@/views/app.events.ts';
import type {
    TestLogHistoryViewModel,
    TestLogsInputProtocol,
    TestLogsOutputProtocol,
} from '@/views/test-logs/test-logs.protocol.ts';
import type { Optional } from '@/common/types.ts';

type TestLogsEvent = {
    data: string;
    type: AppEventSourceType;
};

class TestLogsInteractor
    extends BaseInteractor<TestLogsOutputProtocol, TestLogEntity>
    implements TestLogsInputProtocol
{
    private static readonly SELECTED_UUID = 'selectedUuid';

    constructor(private readonly forcedUuid: Optional<string>) {
        super();
        this.entity = this.initEntity(forcedUuid);
    }

    startListeningToTestLogs(preProcessing: Function, uuid?: string): void {
        let isPreProcessed = false;
        const wrappedHandler = (events: TestLogsEvent[]) => {
            if (!isPreProcessed) {
                preProcessing();
                isPreProcessed = true;
            }
            this.outputProtocol?.onTestLogStreamReceived(events);
        };
        const logStream = uuid
            ? this.getTestLogsState().getTestLogsByUuid(uuid)?.stream
            : this.getTestLogsState().getRecentTestLogs.stream;
        this.entity.testLogsListener = logStream
            .pipe(bufferCount(this.getAppConfigs().maxElementToRenderPerRenderingCycle))
            .subscribe(wrappedHandler);
    }

    checkIfStreamIsFromServer(uuid: string): void {
        const testLog = this.getTestLogsState().getTestLogsByUuid(uuid);
        const isStreamFromServer =
            !!testLog && testLog.eventSource?.readyState !== EventSource.CLOSED;
        this.outputProtocol?.onStreamSourceChecked(isStreamFromServer);
    }

    stopListeningToTestLogs(): void {
        this.entity.unsubscribeTestLogListener();
    }

    fetchTestLogsByUuid(uuid: string): void {
        this.outputProtocol?.onTestLogFetched(this.getTestLogsState().getTestLogsByUuid(uuid));
    }

    fetchTestLogsHistory(): void {
        const mapper = (uuid: string, creationDate: string, testName: string) =>
            ({
                label: testName,
                creationDate,
                value: uuid,
            }) as TestLogHistoryViewModel;

        const testRuns = this.getTestLogsState()
            .getTestLogsHistory(mapper)
            .reverse() as TestLogHistoryViewModel[];

        this.outputProtocol?.onTestLogsHistoryFetched(testRuns);
    }

    fetchTestLogParams(uuid: string): void {
        this.outputProtocol?.onTestLogParamsFetched(
            this.getTestLogsState().getTestLogParamsByUuid(uuid),
        );
    }

    fetchSelectedUuid(): void {
        this.outputProtocol?.onSelectedUuidFetched(this.entity.selectedUuid ?? 'No UUID Found');
    }

    setUuidAsSelected(selectedTestUuid: string): void {
        this.entity.selectedUuid = selectedTestUuid;
        this.saveToGpStateStore(TestLogsInteractor.SELECTED_UUID, selectedTestUuid);
    }

    protected initEntity(forcedUuid: Optional<string>): TestLogEntity {
        const testLogsEntity = createTestLogEntity();
        testLogsEntity.selectedUuid =
            forcedUuid ?? this.getFromGpStateStore(TestLogsInteractor.SELECTED_UUID, undefined);
        if (forcedUuid) {
            this.saveToGpStateStore(TestLogsInteractor.SELECTED_UUID, forcedUuid);
        }
        return testLogsEntity;
    }

    protected getComponentName(): string {
        return 'testLogs';
    }

    destroy(): void {
        this.stopListeningToTestLogs();
    }
}

type InteractorType = TestLogsInputProtocol & BaseInteractor<TestLogsOutputProtocol, TestLogEntity>;
const useTestLogsInteractor = (forcedUuid: Optional<string>) =>
    new TestLogsInteractor(forcedUuid) as InteractorType;

export { type TestLogsEvent, useTestLogsInteractor };
