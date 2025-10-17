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
        <LazyRenderableView :render="testLogsContainerIsLoaded">
            <div
                ref="logContainer"
                class="inflexible-container test-log-container flex-column-container"
                style="flex-grow: 1"
            >
                <template v-if="isTestRunsHistoryNotEmpty">
                    <template v-for="(item, index) in testLogs" :key="index">
                        <div
                            v-memo="selectedTestUuid"
                            :class="eventCssClassMap[item.type]"
                            class="test-log-item"
                        >
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
        </LazyRenderableView>
    </VerticalLayout>
    <LazyRenderableView :render="selectableItemsTableForTestRunParamsIsLoaded">
        <DialogView
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
        </DialogView>
    </LazyRenderableView>
    <LazyRenderableView :render="selectableItemsTableForTestRunsHistoryIsLoaded">
        <DialogView v-model="testRunHistoryDialogBoxOpened" title="Test Runs History">
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
        </DialogView>
    </LazyRenderableView>
</template>
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
import DialogView from '@/components/containers/DialogView.vue';
import {
    type AppEvents,
    AppEventsInjectionKey,
    type AppEventSourceType,
} from '@/views/app.events.ts';
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
import LazyRenderableView from '@/components/containers/LazyRenderableView.vue';
import { useErrorHandler } from '@/components/composable/error-handler.ts';
import { useRequestAnimationFrame } from '@/components/composable/animation-frame.ts';

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
let renderingAnimationFrameId: number;
let scrollAnimationFrameId: number;

const onTestLogStreamReceived = (logChunk: TestLogsEvent[]) => {
    chunkedTestLogs.push(logChunk);
    if (eventHandlerPaused) {
        eventHandlerPaused = false;
        renderTestEvent();
    }
};
const scrollToBottomOfLogContainer = () => {
    scrollAnimationFrameId = requestAnimationFrame(() => {
        if (logContainer.value) {
            logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
    });
};
/**
 *  requestAnimationFrame is very important, it allows us to render elements with size defined by
 *  appConfig.maxElementToRenderPerRenderingCycle as soon as they enter the buffer and synchronized with frame rate,
 *  without it we will have to wait for the entire recursion to be finished to render, meaning rendering all at once and in one frame.
 * */
const renderTestEvent = () => {
    if (chunkedTestLogs.length === 0) {
        eventHandlerPaused = true;
        return;
    }
    renderingAnimationFrameId = requestAnimationFrame(() => {
        const arrayToRender = chunkedTestLogs.shift();
        if (!arrayToRender || arrayToRender.length === 0) {
            eventHandlerPaused = true;
            return;
        }
        eventHandlerPaused = true;
        const lastEvent = arrayToRender[arrayToRender.length - 1];
        if (lastEvent?.type === 'TEST_END') {
            testLogsSummary.value = arrayToRender.pop()!.data;
            testLogs.value.push(...arrayToRender);
            triggerRef(testLogs);
            isStreamCurrentlyActive.value = false;
        } else {
            testLogs.value.push(...arrayToRender);
            triggerRef(testLogs);
            renderTestEvent();
        }
        scrollToBottomOfLogContainer();
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
    useRequestAnimationFrame(() =>
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
    testLogsInputInteractor.destroy();
    cancelAnimationFrame(renderingAnimationFrameId);
    cancelAnimationFrame(scrollAnimationFrameId);
});
</script>
<style scoped>
.test-summary {
    border-top: var(--border-thick-solid) black;
    font-weight: bold;
    height: 48px;
    align-content: center;
    margin-top: 16px;
}

.test-log-container {
    height: calc(100% - 55px);
    content-visibility: auto;
    contain-intrinsic-size: 5000px;
    will-change: transform;
    overflow: auto;
    margin-top: var(--element-gap);
    --comment-bg: rgb(33, 150, 243, 0.1);
    --comment-border: rgb(33, 150, 243);
    --success-bg: rgb(76, 175, 80, 0.1);
    --success-border: rgb(76, 175, 80);
    --error-bg: rgb(176, 0, 32, 0.1);
    --error-border: rgb(176, 0, 32);

    .test-log-item {
        min-height: 60px;
        contain: strict;
        align-content: center;
        width: calc(100% - var(--element-gap) - 4px);
    }

    .scenario-start {
        border-bottom: var(--border-thick-dashed) lightgray;
        font-weight: bold;
        margin-bottom: var(--element-gap);
        align-content: end;
    }

    .successful,
    .successful-results {
        border: var(--border-thick-solid) var(--success-border);
        background: var(--success-bg);
        padding-left: var(--element-gap);
        border-radius: 8px;

        &.successful {
            margin-top: var(--element-gap);
            border-bottom: none;
            border-radius: 8px 8px 0 0;
        }

        &.successful-results {
            border-top: var(--border-thin-dashed) var(--success-border);
            border-radius: 0 0 8px 8px;
        }
    }

    .comment {
        border: var(--border-thick-solid) var(--comment-border);
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
        border-left: var(--border-thick-solid) var(--error-border);
        border-right: var(--border-thick-solid) var(--error-border);

        &.error {
            margin-top: var(--element-gap);
            border-top: var(--border-thick-solid) var(--error-border);
            border-radius: 8px 8px 0 0;
        }

        &.error-details {
            border-top: var(--border-thin-dashed) var(--error-color);
            border-bottom: var(--border-thick-solid) var(--error-border);
            border-radius: 0 0 8px 8px;
        }
    }
}
</style>
