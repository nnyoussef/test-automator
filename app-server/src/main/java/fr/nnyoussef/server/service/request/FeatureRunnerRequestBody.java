package fr.nnyoussef.server.service.request;

import java.util.Map;

public record FeatureRunnerRequestBody(String path,
                                       Map<String, String> testParams) {
}
