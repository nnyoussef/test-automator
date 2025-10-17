import { BaseInteractor } from '@/common/base-interactor.ts';
import { AppEventSourceEnum, type AppEventSourceType } from '@/views/app.events.ts';

class AppInteractor extends BaseInteractor<never, never> {
    constructor() {
        super();
    }

    public handleRunTestEvent(uuid: string) {
        const url = `${this.getAppConfigs().apiProperties.url}/test/run-test?uuid=${uuid}`;
        const eventSource = new EventSource(url);
        this.getTestLogsState().registerEventSource(uuid, eventSource);
        eventSource.onerror = () => {
            this.getTestLogsState().testLogsForUuidComplete(uuid);
        };

        this.getTestLogsState().setLastCreatedUuidTo(uuid);

        const eventPublisher = (ev: MessageEvent, eventName: AppEventSourceType) => {
            const dataToTransmit = { uuid, data: ev.data, type: eventName };
            this.getTestLogsState().putTestLogInHistoryWithUuid(dataToTransmit, uuid);
        };

        Object.values(AppEventSourceEnum)
            .map((type) => <AppEventSourceType>type)
            .forEach((type) =>
                eventSource.addEventListener(type, (event) => eventPublisher(event, type), {
                    signal: this.abortController.signal,
                }),
            );
    }

    protected getComponentName(): string {
        return 'app';
    }
}

export const createAppInteractor = () => new AppInteractor();
