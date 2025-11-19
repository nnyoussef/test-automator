package fr.nnyoussef.server.infrastructure.functions;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
@Lazy
public final class GetTestRunnerInputDataFunction extends BaseFunction implements Function<String, Object> {

    public GetTestRunnerInputDataFunction(BeanFactory beanFactory) {
        super(beanFactory);
    }

    @Override
    public Object apply(String uuid) {

        return getCache().get(uuid, Function.identity());
    }
}
