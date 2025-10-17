<script lang="ts" setup>
import { defineAsyncComponent, inject, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import VerticalLayoutBox from '@/components/layouts/VerticalLayoutBox.vue';
import FileSelectorList from '@/components/interactive/FileSelectorList.vue';
import IconButton from '@/components/interactive/IconButton.vue';
import { type AppEvents, AppEventsInjectionKey } from '@/views/app.events.ts';
import { createRunTestInputProtocol } from '@/views/run-test/run-test.interactor.ts';
import { type TestMetaDataViewModel } from '@/views/run-test/run-test.protocol.ts';
import type { KeyValueMap } from '@/common/types';
import { useRequestAnimationFrame } from '@/components/composable/animation-frame.ts';
import { useErrorHandler } from '@/components/composable/error-handler.ts';
import LazyRenderableView from '@/components/containers/LazyRenderableView.vue';

const appEvents = inject(AppEventsInjectionKey) as AppEvents;
const inputProtocol = createRunTestInputProtocol();
useErrorHandler();

const testsAvailable = shallowRef<TestMetaDataViewModel[]>([]);
const testExplorerRefreshLoader = ref(false);
const selectedTest = ref<TestMetaDataViewModel>();
const currentTestLaunchConfiguration = ref<KeyValueMap>();
const testRunConfPanelIsLoaded = ref(false);
const testRunConfLoader = ref(false);
const loadForm = ref(false);

const DynamicallyConfiguredForm = defineAsyncComponent(
    () => import('@/components/dynamic-form/DynamicFormView.vue'),
);

// Event handler for test selection
function handleTestSelected(data: { name: string; path: string }) {
    loadForm.value = true;
    useRequestAnimationFrame(() => {
        selectedTest.value = { name: data.name, location: data.path };
        inputProtocol.getTestSpecificDetails(data.path);
    });
}

// Event handler for form submission
function handleFormSubmit(data: KeyValueMap) {
    if (!selectedTest.value) return;
    inputProtocol.registerForTestRunner(selectedTest.value.name, selectedTest.value.location, data);
}

// Output protocol handlers
function handleAllTestAvailable(data: TestMetaDataViewModel[]) {
    testsAvailable.value = data;
    useRequestAnimationFrame(() => (testRunConfPanelIsLoaded.value = true));
}

function handleTestSpecificDetails(testConfig: KeyValueMap) {
    currentTestLaunchConfiguration.value = testConfig;
}

function handleRegisterForTestRunnerFailure(error: string) {
    appEvents.POPUP_KO.next(error);
}

function handleRegisterForTestRunnerSuccess(uuid: string) {
    appEvents.RUN_TEST.next(uuid);
}

function handleTestConfigurationForPathRefreshed(data: KeyValueMap) {
    testRunConfLoader.value = false;
    currentTestLaunchConfiguration.value = data;
    appEvents.POPUP_OK.next('List of test has been refreshed');
}

function handleTestListRefreshed(data: TestMetaDataViewModel[]) {
    testsAvailable.value = data;
    testExplorerRefreshLoader.value = false;
}

function handleExternalCallError(apiError: any) {
    appEvents.POPUP_KO.next({
        err: apiError,
        info: 'Error while calling external API',
        instance: this,
    });
}

// Refresh actions
function refreshTestAvailableList() {
    testExplorerRefreshLoader.value = true;
    inputProtocol.refreshAllTestAvailable();
}

function refreshSelectedTestConfigurations() {
    testRunConfLoader.value = true;
    if (selectedTest.value) {
        inputProtocol.refreshTestsConfigsInputsForPath(selectedTest.value.location);
    }
}

// Assign output protocol
inputProtocol.outputProtocol = {
    allTestAvailable: handleAllTestAvailable,
    testSpecificDetails: handleTestSpecificDetails,
    registerForTestRunnerFailure: handleRegisterForTestRunnerFailure,
    registerForTestRunnerSuccess: handleRegisterForTestRunnerSuccess,
    testConfigurationForPathRefreshed: handleTestConfigurationForPathRefreshed,
    testListRefreshed: handleTestListRefreshed,
    externalCallError: handleExternalCallError,
};

onMounted(() => {
    inputProtocol.getAllTestAvailable();
});

onUnmounted(() => inputProtocol.destroy());
</script>

<template>
    <div style="display: grid; height: 100%" class="layout-containment">
        <div style="grid-column: 1/6; grid-row: 1/1; height: 100%" class="inflexible-container">
            <VerticalLayoutBox>
                <template #title>
                    Test Explorer
                    <IconButton
                        id="refreshTestAvailableList"
                        icon="reload"
                        @click="refreshTestAvailableList"
                        button-label="Reload List"
                        button-text-color="midnightblue"
                        animation-name="spinning-animation"
                        :animation-in-progress="testExplorerRefreshLoader"
                    />
                    <IconButton
                        icon="document"
                        button-label="Download Documentation"
                        button-text-color="seagreen"
                        id="download-documentation"
                    />
                </template>
                <template #body>
                    <FileSelectorList :files="testsAvailable" @item-selected="handleTestSelected" />
                </template>
            </VerticalLayoutBox>
        </div>
        <div
            v-if="testRunConfPanelIsLoaded"
            style="grid-column: 6/16; grid-row: 1/1; margin-left: var(--element-gap)"
            class="inflexible-container"
        >
            <VerticalLayoutBox>
                <template #title>
                    {{ selectedTest?.name }}
                    <IconButton
                        id="refreshSelectedTestConfigurations"
                        icon="reload"
                        @click="refreshSelectedTestConfigurations"
                        button-label="Reload Test Configuration"
                        button-text-color="midnightblue"
                        animation-name="spinning-animation"
                        :animation-in-progress="testRunConfLoader"
                    />
                    <IconButton
                        icon="document"
                        button-label="Download Documentation"
                        button-text-color="seagreen"
                        id="download-documentation"
                    />
                </template>
                <template #body>
                    <div style="display: contents" class="section-list-container">
                        <LazyRenderableView :render="loadForm">
                            <DynamicallyConfiguredForm
                                formId="testLaunchConfiguration"
                                @onSubmitClicked="handleFormSubmit"
                                :disable-submit-button="false"
                                :form-configuration="currentTestLaunchConfiguration ?? {}"
                            />
                        </LazyRenderableView>
                    </div>
                </template>
            </VerticalLayoutBox>
        </div>
    </div>
</template>
