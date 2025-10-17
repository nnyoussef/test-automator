package fr.nnyoussef.server.infrastructure.functions;

import fr.nnyoussef.server.core.domain.UiRenderingRequest;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringWebFluxTemplateEngine;
import reactor.core.publisher.Mono;

import java.nio.file.Path;
import java.util.Locale;
import java.util.function.BiFunction;

import static java.nio.charset.Charset.defaultCharset;
import static java.nio.file.Path.of;
import static java.nio.file.StandardOpenOption.*;
import static org.springframework.http.MediaType.TEXT_HTML;

@Service
public class UiRenderFunction implements BiFunction<UiRenderingRequest, String, Mono<String>> {

    @Value("${resourcedir}")
    private String resDir;

    private final SpringWebFluxTemplateEngine templateEngine;

    private static final DefaultDataBufferFactory DEFAULT_DATA_BUFFER_FACTORY = new DefaultDataBufferFactory(true, 208_896);//204KB
    private static final String OUTPUT_FILE_NAME_FORMAT = "output/%s.html";

    public UiRenderFunction(SpringWebFluxTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    @Override
    public Mono<String> apply(UiRenderingRequest uiRenderingRequest,
                              String outputId) {
        String templateName = uiRenderingRequest.templateName();
        Context context = new Context(Locale.getDefault(), uiRenderingRequest.variables());

        String fileName = OUTPUT_FILE_NAME_FORMAT.formatted(outputId);
        Path outputPath = of(resDir, fileName);

        templateEngine.clearTemplateCacheFor(templateName);

        Publisher<DataBuffer> dataBufferPublisher = templateEngine.processStream(
                templateName,
                null,
                context,
                DEFAULT_DATA_BUFFER_FACTORY,
                TEXT_HTML,
                defaultCharset()
        );


        return DataBufferUtils.write(
                        dataBufferPublisher,
                        outputPath,
                        CREATE,
                        TRUNCATE_EXISTING,
                        SPARSE)
                .then(Mono.fromCallable(() -> "http://localhost:8080/api/resources/info/download/" + fileName));
    }
}
