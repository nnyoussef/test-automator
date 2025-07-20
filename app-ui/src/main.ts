import { createPinia } from 'pinia';
import App from './app.vue';
import { createApp } from 'vue';
import router from './router';
import { routeToErrorViewer } from '@/composable/error-handler.ts';

requestAnimationFrame(() => {
    const app = createApp(App);
    app.use(router);
    app.use(createPinia());
    app.mount('#app');
    if (import.meta.env.MODE === 'DEV') {
        app.config.performance = true;
    }
    if (import.meta.env.VITE_WEB_VITALS_ACTIVE) {
        import('web-vitals')
            .then((vitals) => {
                vitals.onCLS(console.log); // Cumulative Layout Shift
                vitals.onFCP(console.log); // First Input Delay
                vitals.onLCP(console.log); // Largest Contentful Paint
                vitals.onINP(console.log); // Input Delay
                vitals.onTTFB(console.log); // Time to First Byte
            })
            .catch((err) => console.error(err));
    }

    app.config.errorHandler = routeToErrorViewer;
});
