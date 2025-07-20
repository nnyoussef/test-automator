import { appConfigs } from '@/app.config.ts';
import { defineStore } from 'pinia';
import { ReplaySubject } from 'rxjs';
import type { AppEventSourceType } from '@/app.events.ts';
import type { KeyValueMap } from '@/common/types';

const maxTestRunsNumber = appConfigs.maxTestRunnerCount;
type TestLogsHistoryType = KeyValueMap<TestLogRecord>;

export type TestLogRecord = {
    stream: ReplaySubject<{ type: AppEventSourceType; data: string }>;
    params?: KeyValueMap;
    createdAt?: string;
    testName?: string;
    eventSource?: EventSource;
};

type TestLogsState = {
    testLogsHistory: TestLogsHistoryType;
    lastCreatedUuid: string;
};

export const useTestLogsState = defineStore('test-logs', {
    state: (): TestLogsState => ({
        testLogsHistory: {} as TestLogsHistoryType,
        lastCreatedUuid: '' as string,
    }),
    getters: {
        getRecentTestLogs(state): TestLogRecord {
            return state.testLogsHistory[state.lastCreatedUuid];
        },
        getTestLogsByUuid(state) {
            return (uuid: string): TestLogRecord => state.testLogsHistory[uuid];
        },
        getTestLogsHistory(state) {
            return (mapperFunction: (uuid: string, creationDate: string, name: string) => any) => {
                return Object.keys(state.testLogsHistory).map((uuid) =>
                    mapperFunction(
                        uuid,
                        this.testLogsHistory[uuid].createdAt!.toLocaleString(),
                        this.testLogsHistory[uuid].testName!,
                    ),
                );
            };
        },
        getLastCreatedUuid(state): string {
            return state.lastCreatedUuid;
        },
        canAddAnotherTestLog(state) {
            return (
                Object.keys(state.testLogsHistory).length < maxTestRunsNumber ||
                (Object.entries(state.testLogsHistory)[maxTestRunsNumber - 1][1].stream.closed ??
                    true)
            );
        },
        getTestLogParamsByUuid(state) {
            return (uuid: string) => state.testLogsHistory[uuid].params;
        },
    },
    actions: {
        addNewTestLogStream(uuid: string, testName: string, params: {}) {
            this.testLogsHistory[uuid] = {
                stream: new ReplaySubject(),
                params: params,
                createdAt: new Date().toLocaleString(),
                testName: testName,
            };
        },
        putTestLogInHistoryWithUuid(log: { type: AppEventSourceType; data: string }, uuid: string) {
            if (this.testLogsHistory[uuid].stream.closed) {
                this.testLogsHistory[uuid].stream = new ReplaySubject();
            }
            this.testLogsHistory[uuid].stream.next(log);
        },
        testLogsForUuidComplete(uuid: string) {
            this.testLogsHistory[uuid]?.stream.complete();
        },
        setLastCreatedUuidTo(lastCreatedUuid: string) {
            this.lastCreatedUuid = lastCreatedUuid;
            const keys = Object.keys(this.testLogsHistory);
            if (keys.length === maxTestRunsNumber) {
                this.testLogsHistory[keys[maxTestRunsNumber - 1]].stream.complete();
                this.testLogsHistory[keys[maxTestRunsNumber - 1]].stream.unsubscribe();
                delete this.testLogsHistory[keys[maxTestRunsNumber - 1]];
            }
        },
        clearTestLogStream(uuid: string) {
            this.testLogsHistory[uuid].stream.complete();
            this.testLogsHistory[uuid].stream.unsubscribe();
            this.testLogsHistory[uuid].stream = new ReplaySubject();
        },
        registerEventSource(uuid: string, eventSource: EventSource) {
            this.clearTestLogStream(uuid);
            this.testLogsHistory[uuid]?.eventSource?.close();
            this.testLogsHistory[uuid].eventSource = eventSource;
        },
    },
});

//General purpose
export const useGpState = defineStore('gp', {
    state: () => ({}) as KeyValueMap<any>,
    getters: {
        getByKeys(state) {
            return (component: string, variableName: string = '', defaultValue: any = null) => {
                if (state[component] === undefined) {
                    return defaultValue;
                }
                return state[component][variableName] ?? defaultValue;
            };
        },
    },
    actions: {
        putByKey(component: string, variableName: string, value: any) {
            if (this[component] === undefined) {
                this[component] = {};
            }
            this[component][variableName] = value;
        },
    },
});
