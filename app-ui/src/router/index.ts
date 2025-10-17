import { createRouter, createWebHistory } from 'vue-router';
import RunTest from '@/views/run-test/run-test.vue';

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
            component: () => import('@/views/test-logs/test-logs.vue'),
            meta: { tabIndex: 1 },
        },
        {
            path: '/help',
            component: () => import('@/views/help/help.vue'),
            meta: { tabIndex: 2 },
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/explorer',
            meta: { tabIndex: 0 },
        },
        {
            path: '/error',
            component: () => import('@/views/error/error-viewer.vue'),
        },
    ],
});

export default router;
