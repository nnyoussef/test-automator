function _() {
    const id = karate.properties.id;
    const testParams = Java.type('fr.nnyoussef.server.core.TestContext').getInstance().getTestParamsByUuid(id);
    return {context: testParams};
}
