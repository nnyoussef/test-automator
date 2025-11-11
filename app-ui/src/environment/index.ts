import { Axios as axios } from 'axios-observable/dist/axios';

type AppEnv = Readonly<{
    maxTestRunnerCount: number;
    maxElementToRenderPerRenderingCycle: number;
    isLoggingEnabled: boolean;
    apiProperties: ApiProperties;
}>;
type ApiProperties = Readonly<{
    url: string;
    count: number;
    delay: number;
    resetOnSuccess: boolean;
    timeOut: number;
}>;

const env: AppEnv = {
    maxTestRunnerCount: import.meta.env.VITE_MAX_TEST_RUN_NUMBER,
    maxElementToRenderPerRenderingCycle: import.meta.env.VITE_MAX_ELEMENT_TO_RENDER_PER_CYCLE,
    isLoggingEnabled: import.meta.env.VITE_LOGGING_ALLOWED,
    apiProperties: {
        url: import.meta.env.VITE_API_URL,
        count: import.meta.env.VITE_HTTP_REQUEST_RETRY_MAX_COUNT,
        delay: import.meta.env.VITE_HTTP_REQUEST_RETRY_BACKOFF,
        resetOnSuccess: true,
        timeOut: import.meta.env.VITE_HTTP_REQUEST_TIMEOUT,
    },
};

axios.defaults.allowAbsoluteUrls = false;
axios.defaults.baseURL = env.apiProperties.url;
axios.defaults.timeout = env.apiProperties.timeOut;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

requestIdleCallback(() => {
    if (!env.isLoggingEnabled) {
        globalThis.alert = () => {
            // Disable alert dialogs
        };
        globalThis.confirm = () => false;
        globalThis.prompt = () => '';
    }
    if (import.meta.env.VITE_WEB_VITALS_ACTIVE === 'true') {
        import('web-vitals').then((vitals): void | null => {
            requestIdleCallback(() => {
                // eslint-disable-next-line no-console
                vitals.onCLS(console.log); // Cumulative Layout Shift
                // eslint-disable-next-line no-console
                vitals.onFCP(console.log); // First Input Delay
                // eslint-disable-next-line no-console
                vitals.onLCP(console.log); // Largest Contentful Paint
                // eslint-disable-next-line no-console
                vitals.onINP(console.log); // Input Delay
                // eslint-disable-next-line no-console
                vitals.onTTFB(console.log);
            });
            return null;
        });
    }
});

export { env };
export type { AppEnv, ApiProperties };
