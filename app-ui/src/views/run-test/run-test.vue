<script lang="ts" setup>
import { defineAsyncComponent, inject, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import VerticalLayoutBox from '@/components/layouts/VerticalLayoutBox.vue';
import FileSelectorList from '../../components/interactive/FileSelectorList.vue';
import { type AppEvents, AppEventsInjectionKey } from '@/app.events.ts';
import { createRunTestInputProtocol } from '@/views/run-test/run-test.interactor.ts';
import IconButton from '@/components/interactive/IconButton.vue';
import type { FormConfigurations } from '@/components/dynamic-form';
import { type TestMetaDataViewModel } from '@/views/run-test/run-test.protocol.ts';
import type { KeyValueMap } from '@/common/types';
import { useRequestAnimationFrame } from '@/composable/animation-frame.ts';
import { useErrorHandler } from '@/composable/error-handler.ts';

const appEvents: AppEvents = <AppEvents>inject(AppEventsInjectionKey);
const inputProtocol = createRunTestInputProtocol();
useErrorHandler();

let testsAvailable = shallowRef<TestMetaDataViewModel[]>([]);
let testExplorerRefreshLoader = ref(false);
let selectedTest = ref<TestMetaDataViewModel>();
let currentTestLaunchConfiguration = ref();
let testRunConfPanelIsLoaded = ref(false);
let testRunConfLoader = ref(false);

let DynamicallyConfiguredForm = defineAsyncComponent(
    () => import('@/components/dynamic-form/DynamicallyConfiguredForm.vue'),
);

const testSelected = (data: { name: string; path: string }) => {
    useRequestAnimationFrame(() => {
        selectedTest.value = { name: data.name, location: data.path };
        inputProtocol.getTestSpecificDetails(data.path);
    });
};

const testSpecificDetails = (testConfig: KeyValueMap) => {
    currentTestLaunchConfiguration.value = testConfig;
};

const refreshTestAvailableList = () => {
    testExplorerRefreshLoader.value = true;
    inputProtocol.refreshAllTestAvailable();
};

const refreshSelectedTestConfigurations = () => {
    testRunConfLoader.value = true;
    inputProtocol.refreshTestsConfigsInputsForPath(selectedTest.value?.location!);
};

const onSubmit = (data: FormConfigurations) => {
    inputProtocol.registerForTestRunner(
        selectedTest.value!.name,
        selectedTest.value!.location,
        data,
    );
};

const allTestAvailable = (data: TestMetaDataViewModel[]): void => {
    testsAvailable.value = data;
    requestAnimationFrame(() => (testRunConfPanelIsLoaded.value = true));
};

const registerForTestRunnerFailure = (error: string): void => {
    appEvents.POPUP_KO.next(error);
};

const registerForTestRunnerSuccess = (uuid: string): void => {
    appEvents.RUN_TEST.next(uuid);
};

const testConfigurationForPathRefreshed = (data: KeyValueMap): void => {
    testRunConfLoader.value = false;
    currentTestLaunchConfiguration.value = data;
    appEvents.POPUP_OK.next('List of test has been refreshed');
};

const testListRefreshed = (data: TestMetaDataViewModel[]): void => {
    testsAvailable.value = data;
    testExplorerRefreshLoader.value = false;
};

const externalCallError = (apiError: any) => {
    appEvents.POPUP_KO.next({
        err: apiError,
        info: 'Error while calling external API',
        instance: this,
    });
};

inputProtocol.outputProtocol = {
    allTestAvailable,
    testSpecificDetails,
    registerForTestRunnerFailure,
    registerForTestRunnerSuccess,
    testConfigurationForPathRefreshed,
    testListRefreshed,
    externalCallError,
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
                        button-label="Reload Tests List"
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
                    <FileSelectorList :files="testsAvailable" @item-selected="testSelected" />
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
                        <DynamicallyConfiguredForm
                            formId="testLaunchConfiguration"
                            @onSubmitClicked="onSubmit"
                            :disable-submit-button="false"
                            :form-configuration="currentTestLaunchConfiguration"
                        />
                    </div>
                </template>
            </VerticalLayoutBox>
        </div>
    </div>
</template>
