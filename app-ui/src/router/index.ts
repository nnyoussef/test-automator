import { createRouter, createWebHistory } from 'vue-router';
import RunTest from '@/app/run-test/run-test.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/explorer',
            component: RunTest,
            meta: { tabIndex: 0 },
        },
        {
            path: '',
            component: RunTest,
            meta: { tabIndex: 0 },
        },

        {
            path: '/test-logs',
            component: () => import('@/app/test-logs/test-logs.vue'),
            meta: { tabIndex: 1 },
        },
        {
            path: '/help',
            component: () => import('@/app/help/help-viewer.vue'),
            meta: { tabIndex: 2 },
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/explorer',
            meta: { tabIndex: 0 },
        },
        {
            path: '/error',
            component: () => import('@/app/error/error-viewer.vue'),
        },
    ],
});

export default router;
