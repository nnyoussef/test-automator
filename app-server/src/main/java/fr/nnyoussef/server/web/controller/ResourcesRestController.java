package fr.nnyoussef.server.web.controller;

import com.intuit.karate.core.Feature;
import fr.nnyoussef.server.infrastructure.service.functions.BaseFunction;
import fr.nnyoussef.server.web.response.BasicTestInfoResponse;
import fr.nnyoussef.server.web.response.factory.BasicTestInfoResponseFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.file.Path;
import java.util.Map;

import static java.util.Comparator.comparing;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/api/resources/info")
public final class ResourcesRestController extends BaseFunction {

    private final BasicTestInfoResponseFactory basicTestInfoResponseFactory;

    public ResourcesRestController(BeanFactory beanFactory,
                                   BasicTestInfoResponseFactory basicTestInfoResponseFactory) {
        super(beanFactory);
        this.basicTestInfoResponseFactory = basicTestInfoResponseFactory;
    }

    @GetMapping(
            value = "get/all-tests",
            produces = APPLICATION_JSON_VALUE)
    public Flux<BasicTestInfoResponse> getAllTests() {
        return Flux.fromStream(getAllFeaturesFilesPathSupplier())
                .map(Path::toFile)
                .map(Feature::read)
                .map(basicTestInfoResponseFactory::from)
                .sort((comparing(BasicTestInfoResponse::location)));
    }

    @GetMapping(
            value = "get/all-tests-details",
            produces = APPLICATION_JSON_VALUE
    )
    public Mono<Map<String, Object>> getAllTestsDetails(@RequestParam("from") String featurePath) {
        return Mono.just(featurePath)
                .map(getTestConfigurationsReaderFunction());
    }

    @GetMapping(value = "download/**")
    public Flux<DataBuffer> downloadFile(ServerWebExchange webExchange) {
        return getFileDownloadFunction().apply(webExchange.getRequest().getPath().value());
    }
}
