package fr.nnyoussef.server.web.response;

import java.util.Map;

public record FeatureRunnerRequestBody(String path,
                                       Map<String, String> testParams) {
}
