import { onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';

function routeToErrorViewer(err: unknown, instance: any, info: string) {
    useRouter()
        .getRoutes()
        .find((r) => r.path === '/error')!.meta = { err, file: instance?.$.type.__file, info };
    useRouter()
        .push({ path: '/error' })
        .then((_) => {
            // Optionally handle the promise resolution or rejection
        });
}

function useErrorHandler() {
    onErrorCaptured((err, instance, info) => {
        routeToErrorViewer(err, instance, info);
    });
}

export { routeToErrorViewer, useErrorHandler };
