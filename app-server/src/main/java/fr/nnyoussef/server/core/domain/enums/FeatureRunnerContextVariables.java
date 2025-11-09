package fr.nnyoussef.server.core.domain.enums;

public enum FeatureRunnerContextVariables {
    ID("id"),
    RENDER("render"),
    PROGRESS_PUBLISHER("progressPublisher"),
    BASE_DIR("baseDir"),
    TEST_CONTEXT("testContext"),
    DATA_HOLDER("dataHolder"),
    ;
    private final String variableName;

    FeatureRunnerContextVariables(String variableName) {
        this.variableName = variableName;
    }

    public String getVariableName() {
        return variableName;
    }

}
