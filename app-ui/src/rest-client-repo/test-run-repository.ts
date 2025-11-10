import { Axios as axios, type AxiosObservable } from 'axios-observable';
import { appConfigs } from '@/config';
import { retry } from 'rxjs';
import { ApiEndpointsConstants } from '@/common/constantes/api-endpoint-constants';
import type { KeyValueMap } from '@/common/types.ts';

type TestRegistrationToken = {
    token: string;
};

/**
 * Registers a test runner with the provided data.
 * @param data - The data containing the path and test parameters.
 * @param abortController - An AbortController to cancel the request if needed.
 * @returns An AxiosObservable that emits the registration token.
 */
function registerForTestRunner(
    data: {
        path: string;
        testParams: KeyValueMap;
    },
    abortController: AbortController,
): AxiosObservable<TestRegistrationToken> {
    return axios
        .post(ApiEndpointsConstants.REGISTER_TO_TEST_RUNNER, data, {
            signal: abortController.signal,
        })
        .pipe(retry(appConfigs.apiProperties));
}

/**
 * Repository for managing test runs.
 * Provides methods to register for a test runner.
 */
export const testRunRepository = {
    registerForTestRunner,
};
