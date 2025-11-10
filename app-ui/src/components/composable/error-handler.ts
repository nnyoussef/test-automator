import { onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';

function routeToErrorViewer(error: unknown, instance: unknown, info: string): void {
    // @ts-ignore
    useRouter()
        .getRoutes()

        .find((routerRecord) => routerRecord.path === '/error')!.meta = {
        error,
         
        file: instance?.$.type.__file,
        info,
    };
    useRouter()
        .push({ path: '/error' })
        .then((navigationFailure) => {
            return navigationFailure;
        });
}

function useErrorHandler(): void {
    onErrorCaptured((error, instance: unknown, info) => {
        routeToErrorViewer(error, instance, info);
    });
}

export { routeToErrorViewer, useErrorHandler };
