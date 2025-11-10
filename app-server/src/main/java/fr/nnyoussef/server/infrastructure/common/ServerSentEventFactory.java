package fr.nnyoussef.server.infrastructure.common;

import fr.nnyoussef.server.core.domain.enums.TestResultsEvent;
import org.springframework.http.codec.ServerSentEvent;

public final class ServerSentEventFactory {
    private ServerSentEventFactory() throws IllegalAccessException {
        throw new IllegalAccessException();
    }

    public static ServerSentEvent<String> createSse(TestResultsEvent testResultsEvent,
                                                    String id,
                                                    String data) {
        return ServerSentEvent.<String>builder()
                .data(data)
                .id(id)
                .event(testResultsEvent.name())
                .build();
    }
}
