import type { KeyValueMap } from '@/common/types';

type TestMetaData = {
    name: string;
    location: string;
};

interface TestEntity {
    /**
     * Returns the list of available tests.
     * @returns {TestMetaData[]} Array of test metadata.
     */
    getAvailableTests(): TestMetaData[];

    /**
     * Returns the map of available test configurations.
     * @returns {KeyValueMap} Object mapping test paths to configurations.
     */
    getAvailableTestsConfigs(): KeyValueMap;

    /**
     * Sets the list of available tests.
     * @param {TestMetaData[]} tests - Array of test metadata.
     */
    setAvailableTests(tests: TestMetaData[]): void;

    /**
     * Sets the map of available test configurations.
     * @param {KeyValueMap} testConfigs - Object mapping test paths to configurations.
     */
    setAvailableTestsConfigs(testConfigs: KeyValueMap): void;

    /**
     * Gets the configuration for a specific test path.
     * @param {string} path - The test path.
     * @returns {KeyValueMap} The configuration object for the path.
     */
    getTestConfigAt(path: string): KeyValueMap;

    /**
     * Removes the configuration for a specific test path.
     * @param {string} path - The test path.
     */
    clearTestConfigsWith(path: string): void;

    /**
     * Sets the configuration for a specific test path.
     * @param {string} path - The test path.
     * @param {KeyValueMap} config - The configuration object.
     */
    setTestConfigsWith(path: string, config: KeyValueMap): void;

    /**
     * Resets the entity, clearing all tests and configurations.
     */
    reset(): void;

    /**
     * Checks if there are any available tests.
     * @returns {boolean} True if tests are available, false otherwise.
     */
    hasTests(): boolean;

    /**
     * Checks if a configuration exists for a specific test path.
     * @param {string} path - The test path.
     * @returns {boolean} True if a config exists, false otherwise.
     */
    hasTestConfigAt(path: string): boolean;
}

// Functional Purity
const createRunTestEntity = (): TestEntity => {
    let availableTests: TestMetaData[] = [];
    let availableTestsConfigs: KeyValueMap = {};

    return {
        getAvailableTests: () => availableTests,
        getAvailableTestsConfigs: () => availableTestsConfigs,
        setAvailableTests: (tests: TestMetaData[]) => (availableTests = tests),
        setAvailableTestsConfigs: (testConfigs: KeyValueMap) =>
            (availableTestsConfigs = testConfigs),
        getTestConfigAt: (path: string) => availableTestsConfigs[path],
        clearTestConfigsWith: (path: string) => delete availableTestsConfigs[path],
        setTestConfigsWith: (path: string, config: KeyValueMap) =>
            (availableTestsConfigs[path] = config),
        hasTests: () => availableTests?.length > 0,
        hasTestConfigAt: (path: string) => availableTestsConfigs[path] !== undefined,
        reset: () => {
            availableTests = [];
            availableTestsConfigs = {};
        },
    };
};

export { createRunTestEntity, type TestEntity, type TestMetaData };
