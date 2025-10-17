<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, provide, ref } from 'vue';
import { createAppInteractor } from './app.interactor.ts';
import { AppEventsInjectionKey, type AppEvents } from './app.events.ts';
import { useRequestAnimationFrame } from '@/components/composable/animation-frame.ts';
import { HtmlAttributesConstants } from '@/common/constantes/html-constants.ts';
import type { NoteCardViewProps } from '@/components/containers';
import Toast from '@/components/containers/Toast.vue';
import { Subject } from 'rxjs';

const appInteractor = createAppInteractor();

const appEvents: AppEvents = {
    RUN_TEST: new Subject<string>(),
    POPUP: new Subject(),
};

provide(AppEventsInjectionKey, appEvents);
const router = useRouter();
const popMessage = ref<{ type: NoteCardViewProps['type']; message: string }>();

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
        router.push({ path: '/test-logs', query: { uuid } }).then(() =>
            appInteractor.handleRunTestEvent(uuid, () => {
                appEvents?.POPUP.next({
                    type: 'error',
                    message: 'Error while streaming test logs',
                });
            }),
        );
    });

    appEvents.POPUP.subscribe((event) => {
        popMessage.value = { type: event.type, message: event.message };
    });
});
onUnmounted(() => {
    appInteractor.destroy();
});
</script>

<template>
    <div class="inflexible-container" style="height: 100%">
        <Toast :content="popMessage" to="#app-popups" :duration="5000" :limit="5" />
        <RouterView />
    </div>
</template>
<style />
