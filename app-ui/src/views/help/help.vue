<script lang="ts" setup>
import { ref } from 'vue';
import Loader from '@/components/loading/Loader.vue';
import { useHelpInteractor } from '@/views/help/help-interactor.ts';
import { useErrorHandler } from '@/components/composable/error-handler.ts';

const helpInputInteractor = useHelpInteractor();
useErrorHandler();

const htmlContent = ref<string>('');
const loading = ref<boolean>(true);

function helpContentFetched(content: string) {
    loading.value = false;
    htmlContent.value = content;
}

function helpContentError(err: unknown) {
    loading.value = false;
    htmlContent.value = `<p>Error loading help content: ${err}</p>`;
}

helpInputInteractor.outputProtocol = {
    helpContentFetched,
    helpContentError,
};

helpInputInteractor.fetchHelpContent();
</script>
<template>
    <div class="content">
        <Loader :inprogress="loading"></Loader>
        <div v-memo="htmlContent" v-html="htmlContent"></div>
    </div>
</template>
<style scoped>
.content {
    overflow: auto;
    height: 100%;
    contain: layout;
}
</style>
