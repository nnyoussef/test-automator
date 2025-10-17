export class ApiEndpointsConstants {
    public static readonly GET_ALL_TEST_DETAILS: string = '/resources/info/get/all-tests-details';
    public static readonly GET_ALL_TESTS: string = '/resources/info/get/all-tests';
    public static readonly REGISTER_TO_TEST_RUNNER: string = '/test/register-to-test-runner';

    private constructor() {
        throw new Error('Constants classes to not be initialized');
    }
}
