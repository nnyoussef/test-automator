<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted, provide, ref } from 'vue';
import { APP_EVENTS_INJECTION_KEY, type AppEvents } from './app.events.ts';
import { useRequestAnimationFrame } from '@/components/composable/animation-frame.ts';
import ToastView from '@/components/containers/ToastView.vue';
import { Subject } from 'rxjs';
import type { MessageLevel } from '@/common/types.ts';

const appEvents: AppEvents = {
    POPUP: new Subject(),
};

provide(APP_EVENTS_INJECTION_KEY, appEvents);
const router = useRouter();
const popMessage = ref<{ type: MessageLevel; message: string }>();
const clearAllPopup = ref(false);

onMounted(() => {
    const tabContainer = document.getElementById('app-header-tab-container');
    const selectables = document.getElementsByClassName('tab');
    let selectedTab: HTMLElement | undefined;
    const switchTabs = () => {
        const tabIndexOfCurrentRoute: number = <number>router.currentRoute.value.meta.tabIndex;
        const targetTab = selectables.item(tabIndexOfCurrentRoute) as HTMLElement;

        selectedTab && (selectedTab.dataset.selected = 'false');
        targetTab && (targetTab.dataset.selected = 'true');
        selectedTab = targetTab;
    };

    router.isReady().then(() => switchTabs());
    router.afterEach(() => switchTabs());

    tabContainer?.addEventListener('click', (e: MouseEvent) => {
        const clickedElement: HTMLElement = <HTMLElement>e.target;
        if (clickedElement.dataset.href) {
            const path = clickedElement.dataset.href ?? '';
            useRequestAnimationFrame(() => router.push({ path }));

            selectedTab && (selectedTab.dataset.selected = 'false');
            selectedTab = clickedElement;
            clickedElement.dataset.selected = 'true';
        }
    });

    appEvents.POPUP.subscribe((event) => {
        clearAllPopup.value = event.clearAllBefore ?? false;
        popMessage.value = { type: event.type, message: event.message };
    });
});
</script>

<template>
    <div class="inflexible-container" style="height: 100%">
        <ToastView
            :clearAll="clearAllPopup"
            :content="popMessage"
            to="#app-popups"
            :duration="5000"
            :limit="5"
        />
        <RouterView />
    </div>
</template>
<style />
