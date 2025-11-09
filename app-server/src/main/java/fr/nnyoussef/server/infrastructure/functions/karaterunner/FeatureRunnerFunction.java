package fr.nnyoussef.server.infrastructure.functions.karaterunner;

import com.google.common.collect.ImmutableMap;
import com.intuit.karate.Runner;
import com.intuit.karate.Runner.Builder;
import fr.nnyoussef.server.core.domain.enums.TestResultsEvent;
import fr.nnyoussef.server.infrastructure.functions.BaseFunction;
import fr.nnyoussef.server.infrastructure.functions.UiRenderFunction;
import fr.nnyoussef.server.infrastructure.functions.karaterunner.featurescriptfunction.FeatureProgressReporter;
import fr.nnyoussef.server.infrastructure.functions.karaterunner.featurescriptfunction.FeatureUiRenderingFunction;
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
import java.util.function.Consumer;
import java.util.function.Function;

import static fr.nnyoussef.server.core.domain.enums.FeatureRunnerContextVariables.*;
import static fr.nnyoussef.server.infrastructure.common.ServerSentFactory.createSse;
import static java.util.UUID.randomUUID;

@Service
@Lazy
public final class FeatureRunnerFunction
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

    public FeatureRunnerFunction(BeanFactory beanFactory,
                                 UiRenderFunction uiRenderFunction) {
        super(beanFactory);
        this.uiRenderFunction = uiRenderFunction;
    }

    @Override
    public Flux<ServerSentEvent<String>> apply(FeatureRunnerRequestBody featureRunnerRequestBody) {
        return Flux.create(sink -> {

            FeatureRunnerPerfHook featureRunnerPerfHook = new FeatureRunnerPerfHook(sink);
            Consumer<Mono<?>> jobExporter = featureRunnerPerfHook::addJob;

            BiConsumer<TestResultsEvent, String> dataStreamPublisher = (testResultsEvent, message) -> {
                ServerSentEvent<String> serverSentEvent = createSse(testResultsEvent, randomUUID().toString(), message);
                sink.next(serverSentEvent);
            };

            Map<String, Object> testParams = featureRunnerRequestBody.testParams();
            String featurePath = Path.of(getResDir(), "test-suites", featureRunnerRequestBody.path()).toString();
            String uuid = sink.contextView().get(ID.getVariableName());

            ImmutableMap.Builder<@NonNull String, @NonNull Object> variables = ImmutableMap.builder();
            variables.put(ID.getVariableName(), uuid);
            variables.put(RENDER.getVariableName(), new FeatureUiRenderingFunction(uiRenderFunction, dataStreamPublisher, jobExporter));
            variables.put(PROGRESS_PUBLISHER.getVariableName(), new FeatureProgressReporter(dataStreamPublisher));
            variables.put(TEST_CONTEXT.getVariableName(), testParams);
            variables.put(DATA_HOLDER.getVariableName(), new HashMap<>());

            Runner.callAsync(BUILDER, featurePath, variables.build(), featureRunnerPerfHook);

        });
    }
}