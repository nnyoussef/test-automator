package fr.nnyoussef.server.infrastructure.functions;

import com.google.common.collect.ImmutableMap;
import com.intuit.karate.Runner;
import com.intuit.karate.Runner.Builder;
import fr.nnyoussef.server.core.domain.UiRenderingRequest;
import fr.nnyoussef.server.infrastructure.functions.karaterunnerhook.FeatureRunnerPerfHook;
import fr.nnyoussef.server.web.response.FeatureRunnerRequestBody;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Function;

import static fr.nnyoussef.server.core.common.MapUtils.deepCopyMap;
import static fr.nnyoussef.server.core.domain.enums.FeatureRunnerContextVariables.*;
import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.*;
import static fr.nnyoussef.server.infrastructure.common.ServerSentFactory.createSse;
import static java.util.UUID.randomUUID;
import static reactor.core.scheduler.Schedulers.boundedElastic;

@Service
@Lazy
public final class KarateFeatureRunnerFunction
        extends BaseFunction
        implements Function<FeatureRunnerRequestBody, Flux<ServerSentEvent<String>>> {

    private final UiRenderFunction uiRenderFunction;
    private static final Builder<?> BUILDER = Runner.builder()
            .outputHtmlReport(false)
            .outputJunitXml(false)
            .outputCucumberJson(false)
            .reportDir(null)
            .buildDir(null)
            .backupReportDir(false)
            .configDir(null)
            .suiteReports(null);

    public KarateFeatureRunnerFunction(BeanFactory beanFactory,
                                       UiRenderFunction uiRenderFunction) {
        super(beanFactory);
        this.uiRenderFunction = uiRenderFunction;
    }

    @Override
    public Flux<ServerSentEvent<String>> apply(FeatureRunnerRequestBody featureRunnerRequestBody) {
        return Flux.create(sink -> {

            FeatureRunnerPerfHook featureRunnerPerfHook = new FeatureRunnerPerfHook(sink);

            Map<String, Object> testParams = featureRunnerRequestBody.testParams();
            String featurePath = Path.of(getResDir(), "test-suites", featureRunnerRequestBody.path()).toString();
            String uuid = sink.contextView().get(ID.getVariableName());

            BiConsumer<String, Map<String, Object>> render = (templateName, variables) -> {

                Map<String, Object> variablesHashMap = deepCopyMap(variables);//important because the variables is attached to js context that doesnt allow multi thread creation like boundedElastic
                String renderingUuid = randomUUID().toString();
                UiRenderingRequest uiRenderingRequest = new UiRenderingRequest(templateName, variablesHashMap);
                Mono<ServerSentEvent<String>> uiJob = uiRenderFunction.apply(uiRenderingRequest, renderingUuid)
                        .map(result -> createSse(HTML_REPORT, renderingUuid, result))
                        .doOnSuccess(sink::next)
                        .doOnError(sink::error)
                        .share()
                        .subscribeOn(boundedElastic());

                uiJob.subscribe();
                featureRunnerPerfHook.addJob(uiJob);
            };

            BiConsumer<String, Integer> progressPublisher = (message, percent) -> {
                ServerSentEvent<String> progressEvent = createSse(PROGRESS_EVENT_MESSAGE, randomUUID().toString(), message);
                ServerSentEvent<String> progressPercent = createSse(PROGRESS_EVENT_PERCENTAGE, randomUUID().toString(), percent.toString());
                sink.next(progressEvent);
                sink.next(progressPercent);
            };

            ImmutableMap.Builder<@NonNull String, @NonNull Object> variables = ImmutableMap.builder();
            variables.put(ID.getVariableName(), uuid);
            variables.put(RENDER.getVariableName(), render);
            variables.put(PROGRESS_PUBLISHER.getVariableName(), progressPublisher);
            variables.put(TEST_CONTEXT.getVariableName(), testParams);
            variables.put(DATA_HOLDER.getVariableName(), new HashMap<>());
            Runner.callAsync(BUILDER, featurePath, variables.build(), featureRunnerPerfHook);

        });
    }
}