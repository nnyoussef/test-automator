interface ImportMeta {
    readonly env: {
        readonly VITE_WEB_VITALS_ACTIVE: string;
        readonly VITE_API_URL: string;
        readonly VITE_MAX_TEST_RUN_NUMBER: number;
        readonly VITE_MAX_ELEMENT_TO_RENDER_PER_CYCLE: number;
        readonly VITE_LOGGING_ALLOWED: boolean;
        readonly VITE_HTTP_REQUEST_RETRY_MAX_COUNT: number;
        readonly VITE_HTTP_REQUEST_RETRY_BACKOFF: number;
        readonly VITE_HTTP_REQUEST_TIMEOUT: number;
        readonly MODE: string;
    };
}
