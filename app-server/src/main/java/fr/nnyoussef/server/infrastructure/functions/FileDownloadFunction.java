package fr.nnyoussef.server.infrastructure.functions;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.nio.file.Path;
import java.util.function.Function;

import static org.springframework.core.io.buffer.DataBufferUtils.read;

@Service
@Lazy
public final class FileDownloadFunction extends BaseFunction implements Function<String, Flux<DataBuffer>> {

    private static final int BUFFER_SIZE = 10_485_760;

    public FileDownloadFunction(BeanFactory beanFactory) {
        super(beanFactory);
    }

    @Override
    public Flux<DataBuffer> apply(String s) {
        return read(Path.of(getResDir(), s), new DefaultDataBufferFactory(true), BUFFER_SIZE);
    }
}
