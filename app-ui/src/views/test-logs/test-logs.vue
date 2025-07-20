<script lang="ts" setup>
import {
    defineAsyncComponent,
    inject,
    onMounted,
    onUnmounted,
    ref,
    shallowRef,
    triggerRef,
    useTemplateRef,
} from 'vue';
import Loader from '@/components/loading/Loader.vue';
import VerticalLayout from '@/components/layouts/VerticalLayout.vue';
import DialogBoxWithDynamicContent from '@/components/containers/DialogBoxWithDynamicContent.vue';
import { type AppEvents, AppEventsInjectionKey, type AppEventSourceType } from '@/app.events.ts';
import {
    type TestLogsEvent,
    useTestLogsInteractor,
} from '@/views/test-logs/test-logs.interactor.ts';
import { useRoute } from 'vue-router';
import HorizontalLayout from '@/components/layouts/HorizontalLayout.vue';
import IconButton from '@/components/interactive/IconButton.vue';
import {
    type TestLogHistoryViewModel,
    type TestLogPropertiesViewModel,
} from '@/views/test-logs/test-logs.protocol.ts';
import LazyRenderable from '@/components/containers/LazyRenderable.vue';
import { useErrorHandler } from '@/composable/error-handler.ts';

let selectableItemsTable = defineAsyncComponent(
    () => import('@/components/interactive/SelectableItemsTable.vue'),
);
useErrorHandler();
let selectableItemsTableForTestRunsHistoryIsLoaded = ref(false);
let selectableItemsTableForTestRunParamsIsLoaded = ref(false);
let testLogsContainerIsLoaded = ref(false);
let testLogs = shallowRef<{ type: AppEventSourceType; data: string }[]>([]);
let testLogsSummary = shallowRef<string>();
let testRunsHistory = ref<any[]>([]);
let selectedTestLogParam = ref();
let selectedTestLogParamDialogBoxOpened = ref(false);
let selectedTestLabel = ref('');
let testRunHistoryDialogBoxOpened = ref(false);
let isStreamCurrentlyActive = ref(false);
let isTestRunsHistoryNotEmpty = ref(false);

let renderTestEventAnimationFrameId: number;
let selectedTestUuid: string;
let chunkedTestLogs: { data: string; type: AppEventSourceType }[][] = [];
let eventHandlerPaused = false;
const testLogsInputInteractor = useTestLogsInteractor(<string>useRoute().query.uuid);
const appEvents = inject<AppEvents>(AppEventsInjectionKey);
const logContainer = useTemplateRef<HTMLDivElement>('logContainer');
const eventCssClassMap: Record<AppEventSourceType, string> = {
    SCENARIO: 'scenario-start',
    STEP_SUCCESSFUL: 'successful',
    STEP_SUCCESSFUL_RESULTS: 'successful-results',
    STEP_ERROR: 'error',
    STEP_ERROR_DETAILS: 'error-details',
    COMMENT: 'comment',
    TEST_END: '',
};
const onTestLogStreamReceived = (log: TestLogsEvent[]) => {
    chunkedTestLogs.push(log);
    if (eventHandlerPaused) {
        eventHandlerPaused = false;
        renderTestEvent();
    }
};
const renderTestEvent = () => {
    if (chunkedTestLogs.length === 0) {
        eventHandlerPaused = true;
        return;
    }
    /**
     *  requestAnimationFrame is very important, it allows us to render elements with size defined by
     *  appConfig.maxElementToRenderPerRenderingCycle as soon as they enter the buffer and synchronized with frame rate,
     *  without it we will have to wait for the entire recursion to be finished to render, meaning rendering all at once and in one frame.
     * */
    renderTestEventAnimationFrameId = requestAnimationFrame(() => {
        let arrayToRender = chunkedTestLogs.shift();
        if (arrayToRender![arrayToRender!.length - 1].type === 'TEST_END') {
            testLogsSummary.value = arrayToRender!.pop()!.data;
            testLogs.value.push(...arrayToRender!);
            triggerRef(testLogs);
            isStreamCurrentlyActive.value = false;
        } else {
            testLogs.value.push(...arrayToRender!);
            triggerRef(testLogs);
            renderTestEvent();
        }
    });
};

const clearTestLogView = () => {
    testLogs.value = [];
    chunkedTestLogs = [];
    eventHandlerPaused = true;
};

const onTestLogsSelectionChange = (selection: any) => {
    selectableItemsTableForTestRunParamsIsLoaded.value = false;
    selectedTestUuid = selection.value as string;
    selectedTestLabel.value = selection.label;
    testLogsInputInteractor.stopListeningToTestLogs();
    requestAnimationFrame(() =>
        testLogsInputInteractor.startListeningToTestLogs(clearTestLogView, selectedTestUuid),
    );
    testLogsInputInteractor.setUuidAsSelected(selectedTestUuid);
};

const onSelectedUuidFetched = (uuid: string): void => {
    selectedTestUuid = uuid;
};

const onStreamSourceChecked = (isStreamFromServer: boolean): void => {
    isStreamCurrentlyActive.value = isStreamFromServer;
};

const onTestLogFetched = (testLogProperties: TestLogPropertiesViewModel): void => {
    selectedTestLabel.value = `${testLogProperties.testName} @ ${testLogProperties?.createdAt}`;
};

const onTestLogParamsFetched = (data?: Record<string, any>): void => {
    selectedTestLogParam.value = Object.entries(data ?? {});
};

const onTestLogsHistoryFetched = (history: TestLogHistoryViewModel[]): void => {
    testRunsHistory.value = history;
    isTestRunsHistoryNotEmpty.value = testRunsHistory.value.length !== 0;
};

const reportError = (error: Error): void => {
    console.error('Error in test logs interactor:', error);
};

testLogsInputInteractor.outputProtocol = {
    onSelectedUuidFetched,
    onStreamSourceChecked,
    onTestLogFetched,
    onTestLogParamsFetched,
    onTestLogStreamReceived,
    onTestLogsHistoryFetched,
    reportError,
};

const onInfoButtonClicked = () => {
    if (!selectableItemsTableForTestRunParamsIsLoaded.value) {
        selectableItemsTableForTestRunParamsIsLoaded.value = true;
    }
    testLogsInputInteractor.fetchTestLogParams(selectedTestUuid);
    selectedTestLogParamDialogBoxOpened.value = true;
};

const onTestRepeatClicked = () => {
    isStreamCurrentlyActive.value = true;
    requestAnimationFrame(() =>
        testLogsInputInteractor.startListeningToTestLogs(clearTestLogView, selectedTestUuid),
    );
    appEvents?.RUN_TEST.next(selectedTestUuid);
};

const onTestRunsHistoryClicked = () => {
    if (!selectableItemsTableForTestRunsHistoryIsLoaded.value) {
        selectableItemsTableForTestRunsHistoryIsLoaded.value = true;
    }
    testRunHistoryDialogBoxOpened.value = true;
};

const testRunsHistoryRowMapper = function (arg: any) {
    return [arg.label, arg.creationDate];
};
const testRunsHistorySelectedRowValueGetter = function (arg: any) {
    return arg.value;
};
const testRunsHistorySelectedRowLabelGetter = function (arg: any) {
    return `${arg.label} @ ${arg.creationDate}`;
};

onMounted(() => {
    testLogsContainerIsLoaded.value = true;
    requestAnimationFrame(() => {
        testLogsInputInteractor.fetchSelectedUuid();
        testLogsInputInteractor.fetchTestLogsHistory();
        testLogsInputInteractor.fetchTestLogsByUuid(selectedTestUuid);
        testLogsInputInteractor.checkIfStreamIsFromServer(selectedTestUuid);
        testLogsInputInteractor.startListeningToTestLogs(clearTestLogView, selectedTestUuid);
    });
});

onUnmounted(() => {
    cancelAnimationFrame(renderTestEventAnimationFrameId);
    testLogsInputInteractor.destroy();
});
</script>
<template>
    <VerticalLayout style="height: 100%">
        <HorizontalLayout
            v-if="isTestRunsHistoryNotEmpty"
            style="gap: var(--element-gap); border-bottom: 1px solid black; height: 55px"
        >
            <p style="font-weight: bold">{{ selectedTestLabel }}</p>
            <IconButton
                id="test-replay-button"
                :disabled="isStreamCurrentlyActive"
                button-label="Repeat"
                button-text-color="var(--primary-color)"
                icon="repeat"
                @click="onTestRepeatClicked"
            />
            <IconButton
                id="history-button"
                button-label="History"
                button-text-color=" #5f6368"
                icon="history"
                @click="onTestRunsHistoryClicked"
            />
            <IconButton
                id="info-button"
                button-label="Test Configuration"
                button-text-color="green"
                icon="info"
                @click="onInfoButtonClicked"
            />
            <Loader :inprogress="isStreamCurrentlyActive" />
        </HorizontalLayout>
        <LazyRenderable :render="testLogsContainerIsLoaded">
            <div
                ref="logContainer"
                class="inflexible-container test-log-container flex-column-container"
                style="flex-grow: 1"
            >
                <template v-if="isTestRunsHistoryNotEmpty">
                    <template
                        v-for="(item, index) in testLogs"
                        :key="index"
                        v-memo="selectedTestUuid"
                    >
                        <div :class="eventCssClassMap[item.type]" class="test-log-item">
                            {{ item.data }}
                        </div>
                    </template>
                </template>
                <template v-else>
                    <h3>
                        <RouterLink to="/explorer">No Results Found</RouterLink>
                    </h3>
                </template>
            </div>
            <div class="test-summary inflexible-container">
                {{ testLogsSummary }}
            </div>
        </LazyRenderable>
    </VerticalLayout>
    <LazyRenderable :render="selectableItemsTableForTestRunParamsIsLoaded">
        <DialogBoxWithDynamicContent
            v-model="selectedTestLogParamDialogBoxOpened"
            :title="`${selectedTestLabel} test configurations`"
        >
            <component
                :is="selectableItemsTable"
                :column-name="['Field', 'Value']"
                :disableSelectRow="true"
                :item-to-row-mapper="(arg: any[]) => [arg[0], arg[1].data]"
                :items="selectedTestLogParam"
            ></component>
        </DialogBoxWithDynamicContent>
    </LazyRenderable>
    <LazyRenderable :render="selectableItemsTableForTestRunsHistoryIsLoaded">
        <DialogBoxWithDynamicContent
            v-model="testRunHistoryDialogBoxOpened"
            title="Test Runs History"
        >
            <component
                :is="selectableItemsTable"
                v-memo="[testRunsHistory]"
                :column-name="['Name', 'Creation Date']"
                :disableSelectRow="false"
                :item-to-row-mapper="testRunsHistoryRowMapper"
                :items="testRunsHistory"
                :row-label="testRunsHistorySelectedRowLabelGetter"
                :rowValue="testRunsHistorySelectedRowValueGetter"
                :selected-value="selectedTestUuid"
                @on-selected="onTestLogsSelectionChange"
            ></component>
        </DialogBoxWithDynamicContent>
    </LazyRenderable>
</template>
<style scoped>
.test-log-container {
    height: calc(100% - 55px);
    overflow: auto;
    margin-top: var(--element-gap);
    --comment-bg: rgb(128, 128, 128, 0.1);
    --success-bg: rgb(60, 179, 113, 0.1);
    --error-bg: rgb(220, 20, 60, 0.1);

    .test-log-item {
        min-height: 60px;
        contain: content;
        align-content: center;
        width: calc(100% - var(--element-gap) - 4px);
    }

    .scenario-start {
        border-bottom: var(--border-thick-dashed) lightgray;
        font-weight: bold;
        margin-bottom: var(--element-gap);
        align-content: end;
    }

    .test-summary {
        border-top: var(--border-thick-solid) black;
        font-weight: bold;
        height: 48px;
        align-content: center;
    }

    .successful,
    .successful-results {
        border: var(--border-thick-solid) mediumseagreen;
        background: var(--success-bg);
        padding-left: var(--element-gap);
        border-radius: 8px;

        &.successful {
            margin-top: var(--element-gap);
            border-bottom: none;
            border-radius: 8px 8px 0 0;
        }

        &.successful-results {
            border-top: var(--border-thin-dashed) mediumseagreen;
            border-radius: 0 0 8px 8px;
        }
    }

    .comment {
        border: var(--border-thick-solid) gray;
        border-radius: 8px;
        margin-bottom: var(--element-gap);
        padding-left: var(--element-gap);
        background: var(--comment-bg);
        font-weight: bold;
        margin-top: var(--element-gap);
    }

    .error,
    .error-details {
        background: var(--error-bg);
        padding-left: var(--element-gap);
        border-left: var(--border-thick-solid) var(--error-color);
        border-right: var(--border-thick-solid) var(--error-color);

        &.error {
            margin-top: var(--element-gap);
            border-top: var(--border-thick-solid) var(--error-color);
            border-radius: 8px 8px 0 0;
        }

        &.error-details {
            border-top: var(--border-thin-dashed) var(--error-color);
            border-bottom: var(--border-thick-solid) var(--error-color);
            border-radius: 0 0 8px 8px;
        }
    }
}
</style>
