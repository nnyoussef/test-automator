package fr.nnyoussef.server.infrastructure.functions.karaterunner;

import fr.nnyoussef.server.core.domain.enums.TestResultsEvent;

import java.util.function.BiConsumer;
import java.util.function.ObjIntConsumer;

import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.PROGRESS_EVENT_MESSAGE;
import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.PROGRESS_EVENT_PERCENTAGE;

public class FeatureProgressReporter implements ObjIntConsumer<String> {
    private final BiConsumer<TestResultsEvent, String> dataStreamPublisher;

    public FeatureProgressReporter(BiConsumer<TestResultsEvent, String> dataStreamPublisher) {
        this.dataStreamPublisher = dataStreamPublisher;
    }

    @Override
    public void accept(String message, int percent) {
        dataStreamPublisher.accept(PROGRESS_EVENT_MESSAGE, message);
        dataStreamPublisher.accept(PROGRESS_EVENT_PERCENTAGE, String.valueOf(percent));
    }

}
