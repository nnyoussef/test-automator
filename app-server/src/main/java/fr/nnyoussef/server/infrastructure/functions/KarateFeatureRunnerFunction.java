package fr.nnyoussef.server.infrastructure.functions;

import com.google.common.collect.ImmutableMap;
import com.intuit.karate.Runner;
import com.intuit.karate.Runner.Builder;
import com.intuit.karate.core.Feature;
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
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;

import static fr.nnyoussef.server.core.common.MapUtils.deepCopyJsMap;
import static fr.nnyoussef.server.core.domain.enums.FeatureRunnerContextVariables.*;
import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.HTML_REPORT;
import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.PROGRESS_EVENT;
import static fr.nnyoussef.server.infrastructure.common.ServerSentFactory.createSse;
import static java.util.UUID.randomUUID;
import static reactor.core.scheduler.Schedulers.boundedElastic;

@Service
@Lazy
public final class KarateFeatureRunnerFunction
        extends BaseFunction
        implements Function<FeatureRunnerRequestBody, Flux<ServerSentEvent<String>>> {

    private static final String TEST_END_EVENT_MESSAGE_FORMAT = "%d Passed | %d Failed. Executed in %s";

    private final UiRenderFunction uiRenderFunction;

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

                Map<String, Object> variablesHashMap = deepCopyJsMap(variables);
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

            Consumer<String> progressPublisher = message -> {
                ServerSentEvent<String> progressEvent = createSse(PROGRESS_EVENT, randomUUID().toString(), message);
                sink.next(progressEvent);
            };

            Builder<?> builder = Runner.builder()
                    .features(Feature.read(featurePath))
                    .outputHtmlReport(false)
                    .outputJunitXml(false)
                    .outputCucumberJson(false)
                    .reportDir(null)
                    .buildDir(null)
                    .backupReportDir(false)
                    .configDir(null)
                    .suiteReports(null)
                    .debugMode(false);

            ImmutableMap.Builder<@NonNull String, @NonNull Object> variables = ImmutableMap.builder();
            variables.put(ID.getVariableName(), uuid);
            variables.put(RENDER.getVariableName(), render);
            variables.put(PROGRESS_PUBLISHER.getVariableName(), progressPublisher);
            variables.put(TEST_CONTEXT.getVariableName(), testParams);

            Runner.callAsync(builder, featurePath, variables.build(), featureRunnerPerfHook);

        });
    }
}