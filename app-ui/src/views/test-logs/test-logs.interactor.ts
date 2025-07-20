import { createTestLogEntity, type TestLogEntity } from '@/views/test-logs/test-logs.entity.ts';
import { bufferCount } from 'rxjs';
import { BaseInteractor } from '@/common/base-interactor';
import type { AppEventSourceType } from '@/app.events.ts';
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
    private static readonly SELECTED_UUID: string = 'selectedUuid';

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
        if (!uuid) {
            this.entity.testLogsListener = this.getTestLogsState()
                .getRecentTestLogs.stream.pipe(
                    bufferCount(this.getAppConfigs().maxElementToRenderPerRenderingCycle),
                )
                .subscribe((data) => wrappedHandler(data));
        } else {
            this.entity.testLogsListener = this.getTestLogsState()
                .getTestLogsByUuid(uuid)
                .stream.pipe(bufferCount(this.getAppConfigs().maxElementToRenderPerRenderingCycle))
                .subscribe((data) => wrappedHandler(data));
        }
    }

    checkIfStreamIsFromServer(uuid: string): void {
        const isStreamFromServer =
            this.getTestLogsState().getTestLogsByUuid(uuid) !== undefined &&
            this.getTestLogsState().getTestLogsByUuid(uuid)?.eventSource?.readyState !==
                EventSource.CLOSED;
        this.outputProtocol?.onStreamSourceChecked(isStreamFromServer);
    }

    stopListeningToTestLogs(): void {
        this.entity.unsubscribeTestLogListener();
    }

    fetchTestLogsByUuid(uuid: string): void {
        this.outputProtocol?.onTestLogFetched(this.getTestLogsState().getTestLogsByUuid(uuid));
    }

    fetchTestLogsHistory(): void {
        const history: TestLogHistoryViewModel[] = this.getTestLogsState()
            .getTestLogsHistory((uuid, creationDate, testName) => ({
                label: testName,
                creationDate: creationDate,
                value: uuid,
            }))
            .reverse();
        this.outputProtocol?.onTestLogsHistoryFetched(history);
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
        if (forcedUuid) {
            testLogsEntity.selectedUuid = forcedUuid;
            this.saveToGpStateStore(TestLogsInteractor.SELECTED_UUID, this.forcedUuid);
        } else {
            testLogsEntity.selectedUuid = this.getFromGpStateStore(
                TestLogsInteractor.SELECTED_UUID,
                undefined,
            );
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

const useTestLogsInteractor = (forcedUuid: Optional<string>) =>
    new TestLogsInteractor(forcedUuid) as TestLogsInputProtocol &
        BaseInteractor<TestLogsOutputProtocol, TestLogEntity>;

export { type TestLogsEvent, useTestLogsInteractor };
