<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, provide, reactive } from 'vue';
import { HtmlAttributesConstants } from '../common/constantes/html-constants.ts';
import { createAppInteractor } from './app.interactor.ts';
import { appEvents, AppEventsInjectionKey } from './app.events.ts';
import '@/assets/styles.css';
import { useRequestAnimationFrame } from '@/components/composable/animation-frame.ts';

const appInteractor = createAppInteractor();

provide(AppEventsInjectionKey, appEvents);
const router = useRouter();
const popUpOk = reactive([]);

onMounted(() => {
    const tabContainer = document.getElementById('app-header-tab-container');
    const selectables = document.getElementsByClassName('tab');
    let selectedTab: any;
    const switchTabs = () => {
        const tabIndexOfCurrentRoute: number = <number>router.currentRoute.value.meta.tabIndex;
        const targetTab = selectables.item(tabIndexOfCurrentRoute);
        selectedTab?.setAttribute('data-selected', 'false');
        targetTab?.setAttribute('data-selected', 'true');
        selectedTab = targetTab;
    };

    router.isReady().then(() => switchTabs());
    router.afterEach(() => switchTabs());

    tabContainer?.addEventListener(
        'click',
        (e: MouseEvent) => {
            const clickedElement: HTMLElement = <HTMLElement>e.target;
            if (clickedElement.hasAttribute(HtmlAttributesConstants.DATA_HREF)) {
                const path = clickedElement.getAttribute(HtmlAttributesConstants.DATA_HREF) ?? '';
                useRequestAnimationFrame(() => router.push({ path }));
                selectedTab?.setAttribute(HtmlAttributesConstants.DATA_SELECTED, 'false');
                selectedTab = clickedElement;
                clickedElement.setAttribute(HtmlAttributesConstants.DATA_SELECTED, 'true');
            }
        },
        { signal: appInteractor.abortSignal },
    );

    appEvents.RUN_TEST.subscribe((uuid: string) => {
        router.push({ path: '/test-logs', query: { uuid } }).then(() => {
            appInteractor.handleRunTestEvent(uuid);
        });
    });

    appEvents.POPUP_OK.subscribe(alert);
});
onUnmounted(() => {
    appInteractor.destroy();
});
</script>

<template>
    <div style="background: green; position: absolute" v-for="item in popUpOk" :key="item">
        {{ item }}
    </div>
    <div class="inflexible-container" style="height: 100%">
        <RouterView></RouterView>
    </div>
</template>
