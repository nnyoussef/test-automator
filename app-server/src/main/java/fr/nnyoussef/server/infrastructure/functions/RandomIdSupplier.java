package fr.nnyoussef.server.infrastructure.functions;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.Supplier;

@Service
@Lazy
public final class RandomIdSupplier implements Supplier<String> {

    @Override
    public String get() {
        return UUID.randomUUID().toString();
    }
}
