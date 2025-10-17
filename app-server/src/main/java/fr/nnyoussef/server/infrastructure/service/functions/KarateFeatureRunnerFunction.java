package fr.nnyoussef.server.infrastructure.service.functions;

import com.intuit.karate.Runner;
import com.intuit.karate.RuntimeHook;
import com.intuit.karate.StringUtils;
import com.intuit.karate.Suite;
import com.intuit.karate.core.Feature;
import com.intuit.karate.core.FeatureRuntime;
import com.intuit.karate.core.ScenarioRuntime;
import com.intuit.karate.core.StepResult;
import fr.nnyoussef.server.web.response.FeatureRunnerRequestBody;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;

import java.nio.file.Path;
import java.util.List;
import java.util.function.Function;

import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.*;
import static java.lang.String.format;
import static org.apache.commons.lang3.time.DurationFormatUtils.formatDuration;
import static org.springframework.util.CollectionUtils.isEmpty;

@Service
@Lazy
public final class KarateFeatureRunnerFunction extends BaseFunction implements Function<FeatureRunnerRequestBody, Flux<ServerSentEvent<String>>> {

    private static final String TEST_END_EVENT_MESSAGE_FORMAT = "%d Passed | %d Failed. Executed in %s";
    private static final String NO_RESULTS = "No results";
    private static final String PASSED = "passed";

    public KarateFeatureRunnerFunction(BeanFactory beanFactory) {
        super(beanFactory);
    }

    @Override
    public Flux<ServerSentEvent<String>> apply(FeatureRunnerRequestBody featureRunnerRequestBody) {
        return Flux.create(sink -> {
            Path featurePath = Path.of(getResDir(), featureRunnerRequestBody.path());
            Runner.Builder<?> builder = Runner.builder()
                    .features(Feature.read(featurePath.toString()))
                    .outputHtmlReport(false)
                    .outputJunitXml(false)
                    .outputCucumberJson(false)
                    .hook(new TestRunnerEventListener(sink))
                    .reportDir(null)
                    .buildDir(null)
                    .backupReportDir(false)
                    .configDir(null)
                    .suiteReports(null)
                    .debugMode(false);
            featureRunnerRequestBody.testParams()
                    .forEach(builder::systemProperty);
            builder.parallel(1);
        });
    }

    private final class TestRunnerEventListener implements RuntimeHook {

        FluxSink<ServerSentEvent<String>> sink;

        public TestRunnerEventListener(FluxSink<ServerSentEvent<String>> sink) {
            this.sink = sink;
        }

        @Override
        public void afterStep(StepResult result, ScenarioRuntime sr) {
            publishComment(result.getStep().getComments());
            publish(getServerSentEventFromResultText(result));

            if (result.getResult().getStatus().equals(PASSED)) {
                ServerSentEvent<String> successDetails = ServerSentEvent.<String>builder()
                        .event(STEP_SUCCESSFUL_RESULTS.name())
                        .data(getStepLog(result))
                        .build();
                publish(successDetails);
            } else if (result.getResult().isFailed()) {
                ServerSentEvent<String> errorDetails = ServerSentEvent.<String>builder()
                        .event(STEP_ERROR_DETAILS.name())
                        .data(result.getResult().getError().getLocalizedMessage())
                        .build();
                publish(errorDetails);
            }
        }

        private void publishComment(List<String> comments) {
            if (isEmpty(comments)) return;
            comments.stream()
                    .map(c -> c.substring(1))
                    .forEach(c -> {
                        ServerSentEvent<String> comment = ServerSentEvent.<String>builder()
                                .data(c)
                                .event(COMMENT.name())
                                .build();
                        sink.next(comment);
                    });
        }

        private void publish(ServerSentEvent<String> serverSentEvent) {
            sink.next(serverSentEvent);
        }

        private String getStepLog(StepResult result) {
            if (StringUtils.isBlank(result.getStepLog())) {
                return NO_RESULTS;
            }
            return result.getStepLog();
        }

        @Override
        public boolean beforeScenario(ScenarioRuntime sr) {
            ServerSentEvent<String> stepEvent = ServerSentEvent.<String>builder()
                    .event(SCENARIO.name())
                    .data(sr.scenario.getName())
                    .build();
            sink.next(stepEvent);
            return RuntimeHook.super.beforeScenario(sr);
        }

        @Override
        public void afterFeature(FeatureRuntime fr) {

            long testDuration = ((long) fr.result.getDurationMillis());
            int passedCount = fr.result.getPassedCount();
            int failedCount = fr.result.getFailedCount();
            String testDurationFormatted = formatDuration(testDuration, "HH:mm:ss.SSS");

            String data = format(TEST_END_EVENT_MESSAGE_FORMAT, passedCount, failedCount, testDurationFormatted);

            ServerSentEvent<String> stepEvent = ServerSentEvent.<String>builder()
                    .event(TEST_END.name())
                    .data(data)
                    .build();
            sink.next(stepEvent);
        }

        @Override
        public void afterSuite(Suite suite) {
            sink.complete();
        }

        private ServerSentEvent<String> getServerSentEventFromResultText(StepResult result) {
            String testResultsEvent = UNRECOGNIZED.name();

            if (PASSED.equals(result.getResult().getStatus())) {
                testResultsEvent = STEP_SUCCESSFUL.name();
            } else if (result.getResult().isFailed()) {
                testResultsEvent = STEP_ERROR.name();
            } else if (result.getResult().isSkipped()) {
                testResultsEvent = STEP_SKIPPED.name();
            }
            return ServerSentEvent.<String>builder()
                    .event(testResultsEvent)
                    .data(result.getStep().getText())
                    .build();
        }
    }
}
