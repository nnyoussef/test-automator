import { appConfigs } from '@/config';
import { Axios as axios, type AxiosObservable } from 'axios-observable';
import type { ReadonlyKeyValueMap } from '@/common/types';
import { retry } from 'rxjs';
import { ApiEndpointsConstants } from '@/common/constantes/api-endpoint-constants';

type TestResponseRecord = {
    name: string;
    path: string;
};
type AllAvailableTestResponse = TestResponseRecord[];

/**
 * Fetches all available tests from the server.
 * @param abortController - An AbortController to cancel the request if needed.
 * @returns An AxiosObservable that emits an array of available tests.
 */
function fetchAllAvailableTests(
    abortController: AbortController = new AbortController(),
): AxiosObservable<AllAvailableTestResponse> {
    return axios
        .get<AllAvailableTestResponse>(ApiEndpointsConstants.GET_ALL_TESTS, {
            signal: abortController.signal,
        })
        .pipe(retry(appConfigs.apiProperties));
}

/**
 * Fetches specific details for a given test path.
 * @param path - The path of the test to fetch details for.
 * @param abortController - An AbortController to cancel the request if needed.
 * @returns An AxiosObservable that emits a map of test details.
 */
function fetchTestSpecificDetails(
    path: string,
    abortController: AbortController = new AbortController(),
): AxiosObservable<ReadonlyKeyValueMap> {
    return axios
        .get(ApiEndpointsConstants.GET_ALL_TEST_DETAILS, {
            params: { from: path },
            signal: abortController.signal,
        })
        .pipe(retry(appConfigs.apiProperties));
}

/**
 * Repository for fetching test information.
 * Provides methods to retrieve all available tests and specific test details.
 */
const testInfoRepository = {
    fetchAllAvailableTests,
    fetchTestSpecificDetails,
};

export { testInfoRepository, type AllAvailableTestResponse };
