import { Axios as axios } from 'axios-observable/dist/axios';

type AppConfigs = Readonly<{
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

const appConfigs: AppConfigs = {
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
axios.defaults.baseURL = appConfigs.apiProperties.url;
axios.defaults.timeout = appConfigs.apiProperties.timeOut;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

requestIdleCallback(() => {
    if (!appConfigs.isLoggingEnabled) {
        Object.keys(console).forEach((key) => {
            //@ts-ignore
            console[key] = () => {
                // Disable console logging
            };
        });
        window.alert = () => {
            // Disable alert dialogs
        };
        window.confirm = () => false;
        window.prompt = () => '';
    }
    if (import.meta.env.VITE_WEB_VITALS_ACTIVE === 'true') {
        import('web-vitals').then((vitals) => {
            requestIdleCallback(() => {
                vitals.onCLS(console.log); // Cumulative Layout Shift
                vitals.onFCP(console.log); // First Input Delay
                vitals.onLCP(console.log); // Largest Contentful Paint
                vitals.onINP(console.log); // Input Delay
                vitals.onTTFB(console.log);
            });
        });
    }
});

export { appConfigs };
export type { AppConfigs, ApiProperties };
