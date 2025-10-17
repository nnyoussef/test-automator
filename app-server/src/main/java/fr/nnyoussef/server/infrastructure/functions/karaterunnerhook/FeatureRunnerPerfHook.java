package fr.nnyoussef.server.infrastructure.functions.karaterunnerhook;

import com.intuit.karate.PerfHook;
import com.intuit.karate.core.FeatureResult;
import com.intuit.karate.core.PerfEvent;
import com.intuit.karate.core.ScenarioRuntime;
import com.intuit.karate.http.HttpRequest;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;

import java.util.LinkedList;
import java.util.List;

import static fr.nnyoussef.server.core.domain.enums.FeatureRunnerContextVariables.ID;
import static fr.nnyoussef.server.core.domain.enums.TestResultsEvent.TEST_END;
import static fr.nnyoussef.server.infrastructure.common.ServerSentFactory.createSse;
import static org.apache.commons.lang3.time.DurationFormatUtils.formatDuration;

public class FeatureRunnerPerfHook implements PerfHook {

    private final FluxSink<ServerSentEvent<String>> sink;
    private final List<Mono<?>> jobs = new LinkedList<>();

    private static final String TEST_END_EVENT_MESSAGE_FORMAT = "%d Passed | %d Failed. Executed in %s";

    public FeatureRunnerPerfHook(FluxSink<ServerSentEvent<String>> sink) {
        this.sink = sink;
    }

    @Override
    public String getPerfEventName(HttpRequest httpRequest,
                                   ScenarioRuntime scenarioRuntime) {
        return "";
    }

    @Override
    public void reportPerfEvent(PerfEvent perfEvent) {
        if (perfEvent.isFailed()) {
            sink.error(new Throwable());
        }
    }

    @Override
    public void submit(Runnable runnable) {
        runnable.run();
    }

    @Override
    public void afterFeature(FeatureResult featureResult) {

        long testDuration = ((long) featureResult.getDurationMillis());
        int passedCount = featureResult.getPassedCount();
        int failedCount = featureResult.getFailedCount();
        String testDurationFormatted = formatDuration(testDuration, "HH:mm:ss.SSS");

        String testEndMessage = String.format(TEST_END_EVENT_MESSAGE_FORMAT, passedCount, failedCount, testDurationFormatted);

        Mono.when(jobs)
                .doOnTerminate(() -> {
                    String executionId = sink.contextView().get(ID.getVariableName());
                    sink.next(createSse(TEST_END, executionId, testEndMessage));
                    sink.complete();
                })
                .subscribe();
    }

    @Override
    public void pause(Number number) {
        //empty on purpose
    }

    public void addJob(Mono<?> mono) {
        jobs.add(mono);
    }
}
