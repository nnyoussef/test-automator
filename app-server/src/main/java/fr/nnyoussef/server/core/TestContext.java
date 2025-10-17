package fr.nnyoussef.server.core;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TestContext {

    private final Map<String, Map<String, Object>> testParamsByUuid = new ConcurrentHashMap<>(100);
    private static final TestContext INSTANCE = new TestContext();

    public static TestContext getInstance() {
        return INSTANCE;
    }

    private TestContext() {
    }

    public Map<String, Object> getTestParamsByUuid(String uuid) {
        return testParamsByUuid.get(uuid);
    }

    public void putTestParamsByUuid(String uuid, Map<String, Object> params) {
        testParamsByUuid.put(uuid, params);
    }

    public void removeTestParamsByUuid(String uuid) {
        testParamsByUuid.remove(uuid);
    }
}
