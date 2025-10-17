package fr.nnyoussef.server.core.domain;

import java.util.Map;

public record UiRenderingRequest(String templateName, Map<String, Object> variables) {
}
