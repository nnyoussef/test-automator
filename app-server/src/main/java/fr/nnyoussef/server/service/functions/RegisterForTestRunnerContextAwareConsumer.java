package fr.nnyoussef.server.service.functions;

import fr.nnyoussef.server.common.ContextAwareConsumer;
import fr.nnyoussef.server.service.request.FeatureRunnerRequestBody;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import reactor.util.context.ContextView;

@Service
@Lazy
public final class RegisterForTestRunnerContextAwareConsumer extends BaseFunction implements ContextAwareConsumer<FeatureRunnerRequestBody> {

    public RegisterForTestRunnerContextAwareConsumer(BeanFactory beanFactory) {
        super(beanFactory);
    }

    @Override
    public void apply(FeatureRunnerRequestBody featureRunnerRequestBody,
                      ContextView context) {
        String id = context.get("id");
        getCache().put(id, featureRunnerRequestBody);
    }
}
