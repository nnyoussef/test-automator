package fr.nnyoussef.server.infrastructure.functions.karaterunner.featurescriptfunction;

import fr.nnyoussef.server.core.domain.UiRenderingRequest;
import fr.nnyoussef.server.core.domain.enums.TestResultsEvent;
import fr.nnyoussef.server.infrastructure.functions.UiRenderFunction;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

import static fr.nnyoussef.server.core.common.MapUtils.deepCopyMap;
import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.HTML_REPORT;
import static java.util.UUID.randomUUID;
import static reactor.core.scheduler.Schedulers.boundedElastic;

public final class FeatureUiRenderingFunction implements BiConsumer<String, Map<String, Object>> {

    private final UiRenderFunction uiRenderFunction;
    private final BiConsumer<TestResultsEvent, String> dataStreamPublisher;
    private final Consumer<Mono<?>> jobExporter;

    public FeatureUiRenderingFunction(UiRenderFunction uiRenderFunction,
                                    BiConsumer<TestResultsEvent, String> dataStreamPublisher,
                                    Consumer<Mono<?>> jobExporter) {
        this.uiRenderFunction = uiRenderFunction;
        this.dataStreamPublisher = dataStreamPublisher;
        this.jobExporter = jobExporter;
    }

    @Override
    public void accept(String templateName, Map<String, Object> variables) {
        Map<String, Object> variablesHashMap = deepCopyMap(variables);//important because the variables is attached to js context that doesnt allow multi thread creation like boundedElastic
        String renderingUuid = randomUUID().toString();
        UiRenderingRequest uiRenderingRequest = new UiRenderingRequest(templateName, variablesHashMap);
        Mono<String> uiJob = uiRenderFunction.apply(uiRenderingRequest, renderingUuid)
                .doOnSuccess(result -> dataStreamPublisher.accept(HTML_REPORT, result))
                .share()
                .subscribeOn(boundedElastic());

        uiJob.subscribe();
        jobExporter.accept(uiJob);
    }
}
