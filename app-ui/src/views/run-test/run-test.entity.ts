import type { KeyValueMap } from '@/common/types';

type TestMetaData = {
    directory: string;
    name: string;
    path: string;
};

interface TestEntity {
    getAvailableTests(): TestMetaData[];

    getAvailableTestsConfigs(): KeyValueMap;

    setAvailableTests(tests: TestMetaData[]): void;

    setAvailableTestsConfigs(testConfigs: KeyValueMap): void;

    getTestConfigAt(path: string): KeyValueMap;

    clearTestConfigsWith(path: string): boolean;

    setTestConfigsWith(path: string, config: KeyValueMap): void;

    reset(): void;

    hasTests(): boolean;

    hasTestConfigAt(path: string): boolean;

    setLastSelectedTestPath(selectedTestPath: { name: string; path: string }): void;

    getLastSelectedTestPath(): { name: string; path: string };
}

const createRunTestEntity = (): TestEntity => {
    let availableTests: TestMetaData[] = [];
    let availableTestsConfigs: KeyValueMap = {};
    let lastSelectedTestPath: { name: string; path: string } = { name: '', path: '' };

    const setLastSelectedTestPath = (selectedTestPath: { name: string; path: string }) => {
        lastSelectedTestPath = { ...selectedTestPath };
    };

    const getLastSelectedTestPath = () => ({ ...lastSelectedTestPath });

    const getAvailableTests = () => [...availableTests];
    const getAvailableTestsConfigs = () => ({ ...availableTestsConfigs });
    const getTestConfigAt = (path: string) => availableTestsConfigs[path] ?? {};

    const setAvailableTests = (tests: TestMetaData[]) => {
        availableTests = [...tests];
    };
    const setAvailableTestsConfigs = (testConfigs: KeyValueMap) => {
        availableTestsConfigs = { ...testConfigs };
    };
    const setTestConfigsWith = (path: string, config: KeyValueMap) => {
        availableTestsConfigs[path] = { ...config };
    };

    const hasTests = () => availableTests.length > 0;
    const hasTestConfigAt = (path: string) => availableTestsConfigs.hasOwnProperty(path);

    const clearTestConfigsWith = (path: string) => {
        if (availableTestsConfigs.hasOwnProperty(path)) {
            delete availableTestsConfigs[path];
            return true;
        }
        return false;
    };

    const reset = () => {
        availableTests = [];
        availableTestsConfigs = {};
    };

    return {
        getAvailableTests,
        getAvailableTestsConfigs,
        setAvailableTests,
        setAvailableTestsConfigs,
        getTestConfigAt,
        clearTestConfigsWith,
        setTestConfigsWith,
        hasTests,
        hasTestConfigAt,
        reset,
        setLastSelectedTestPath,
        getLastSelectedTestPath,
    };
};

export { createRunTestEntity, type TestEntity, type TestMetaData };
