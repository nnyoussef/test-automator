package fr.nnyoussef.server.infrastructure.service.functions;

import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class BaseFunction {

    @Value("${resourcedir}")
    private String resDir;

    private final BeanFactory beanFactory;

    public BaseFunction(BeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }

    public String getResDir() {
        return resDir;
    }

    private <T> T getBean(Class<T> tClass) {
        return beanFactory.getBean(tClass);
    }

    public KarateFeatureRunnerFunction getKarateFeatureRunnerFunction() {
        return getBean(KarateFeatureRunnerFunction.class);
    }

    public GetAllFeaturesFilesPathSupplier getAllFeaturesFilesPathSupplier() {
        return getBean(GetAllFeaturesFilesPathSupplier.class);
    }

    public ReadFeatureFromPathFunction getReadFeatureFromPathFunction() {
        return getBean(ReadFeatureFromPathFunction.class);
    }

    public YamlReaderFunction getTestConfigurationsReaderFunction() {
        return getBean(YamlReaderFunction.class);
    }

    public RandomIdSupplier getRandomIdSupplier() {
        return beanFactory.getBean(RandomIdSupplier.class);
    }

    public RegisterForTestRunnerContextAwareConsumer getRegisterForTestRunnerFunction() {
        return beanFactory.getBean(RegisterForTestRunnerContextAwareConsumer.class);
    }

    public GetTestRunnerInputDataFunction getTestRunnerInputDataFunction() {
        return beanFactory.getBean(GetTestRunnerInputDataFunction.class);
    }

    public FileDownloadFunction getFileDownloadFunction() {
        return beanFactory.getBean(FileDownloadFunction.class);
    }

    public Cache<String, Object> getCache() {
        return beanFactory.getBean(Cache.class);
    }
}
