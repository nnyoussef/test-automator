package fr.nnyoussef.server.infrastructure.common;

import reactor.core.publisher.SynchronousSink;
import reactor.util.context.ContextView;

import java.util.function.BiConsumer;

public interface ContextAwareConsumer<T> extends BiConsumer<T, SynchronousSink<T>> {

    void apply(T input,
               ContextView context);

    @Override
    default void accept(T t,
                        SynchronousSink<T> rSynchronousSink) {
        apply(t, rSynchronousSink.contextView());
        rSynchronousSink.next(t);
    }
}
