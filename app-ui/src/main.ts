import { createPinia } from 'pinia';
import App from './views/app.vue';
import { createApp } from 'vue';
import router from './router';
import { routeToErrorViewer } from '@/components/composable/error-handler.ts';

requestAnimationFrame(() => {
    const app = createApp(App);
    app.use(router);
    app.use(createPinia());
    app.mount('#app');
    app.config.errorHandler = routeToErrorViewer;
    if (import.meta.env.MODE === 'dev') {
        app.config.performance = true;
    }
});
