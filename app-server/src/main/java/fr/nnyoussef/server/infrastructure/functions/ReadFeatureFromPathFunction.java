package fr.nnyoussef.server.infrastructure.functions;

import com.intuit.karate.core.Feature;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.function.Function;

import static com.intuit.karate.core.Feature.read;
import static java.nio.file.Path.of;

@Service
@Lazy
public final class ReadFeatureFromPathFunction extends BaseFunction implements Function<String, Feature> {

    public ReadFeatureFromPathFunction(BeanFactory beanFactory) {
        super(beanFactory);
    }

    @Override
    public Feature apply(String path) {
        Path featurePath = of(getResDir(), path);

        return read(featurePath.toAbsolutePath().toFile());
    }
}
