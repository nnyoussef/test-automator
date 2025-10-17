import { appConfigs } from '@/config';
import { defineStore } from 'pinia';
import { ReplaySubject } from 'rxjs';
import type { AppEventSourceType } from '@/views/app.events.ts';
import type { KeyValueMap } from '@/common/types';

const maxTestRunsNumber = appConfigs.maxTestRunnerCount;
type TestLogsHistoryType = KeyValueMap<TestLogRecord>;

export type TestLogRecord = {
    stream: ReplaySubject<{ type: AppEventSourceType; data: string }>;
    params: KeyValueMap;
    createdAt: string;
    testName: string;
    eventSource: EventSource;
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
            return state.testLogsHistory[state.lastCreatedUuid] as TestLogRecord;
        },

        getTestLogsByUuid(state) {
            return (uuid: string): TestLogRecord => state.testLogsHistory[uuid] as TestLogRecord;
        },

        getTestLogsHistory<T>(state: TestLogsState) {
            return (mapperFunction: (uuid: string, creationDate: string, name: string) => T) => {
                return Object.keys(state.testLogsHistory).map((uuid) =>
                    mapperFunction(
                        uuid,
                        this.testLogsHistory[uuid]?.createdAt!.toLocaleString(),
                        this.testLogsHistory[uuid]?.testName!,
                    ),
                );
            };
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
                eventSource: null as unknown as EventSource,
            };
        },
        putTestLogInHistoryWithUuid(log: { type: AppEventSourceType; data: string }, uuid: string) {
            const testLogHistoryRecord = this.getTestLogsByUuid(uuid);
            if (!testLogHistoryRecord) return;
            if (testLogHistoryRecord.stream.closed) {
                testLogHistoryRecord.stream = new ReplaySubject();
            }
            testLogHistoryRecord.stream.next(log);
        },
        testLogsForUuidComplete(uuid: string) {
            this.testLogsHistory[uuid]?.stream.complete();
            this.testLogsHistory[uuid]?.eventSource.close();
        },
        setLastCreatedUuidTo(lastCreatedUuid: string) {
            this.lastCreatedUuid = lastCreatedUuid;
            const keys = Object.keys(this.testLogsHistory);
            if (keys.length === maxTestRunsNumber) {
                const lastKnownUuid = keys[maxTestRunsNumber - 1] as string;
                this.testLogsHistory[lastKnownUuid]?.stream.complete();
                this.testLogsHistory[lastKnownUuid]?.stream.unsubscribe();
                delete this.testLogsHistory[lastKnownUuid];
            }
        },
        clearTestLogStream(uuid: string) {
            const testLogHistoryRecord = this.getTestLogsByUuid(uuid);
            if (!testLogHistoryRecord) return;
            testLogHistoryRecord?.stream.complete();
            testLogHistoryRecord?.stream.unsubscribe();
            testLogHistoryRecord.stream = new ReplaySubject();
        },
        registerEventSource(uuid: string, eventSource: EventSource) {
            const testLogHistoryRecord = this.getTestLogsByUuid(uuid);
            if (!testLogHistoryRecord) return;
            this.clearTestLogStream(uuid);
            testLogHistoryRecord?.eventSource?.close();
            testLogHistoryRecord.eventSource = eventSource;
        },
    },
});

//General purpose
export const useGpState = defineStore('gp', {
    state: () => ({}) as KeyValueMap,
    getters: {
        getByKeys(state) {
            return (component: string, variableName: string = '', defaultValue: any = null) => {
                if (!state[component]) {
                    return defaultValue;
                }
                return state[component][variableName] ?? defaultValue;
            };
        },
    },
    actions: {
        putByKey(component: string, variableName: string, value: any) {
            if (!this[component]) {
                this[component] = {};
            }
            this[component][variableName] = value;
        },
    },
});
