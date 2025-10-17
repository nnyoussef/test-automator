package fr.nnyoussef.server.infrastructure.functions;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Path;
import java.util.Map;
import java.util.function.Function;

@Service
@Lazy
public final class TestConfigurationsReader extends BaseFunction implements Function<String, Map<String, Object>> {

    private static final String TEST_FORM_FILE_EXTENSION = ".form.yaml";
    private static final Yaml YAML = new Yaml();

    public TestConfigurationsReader(BeanFactory beanFactory) {
        super(beanFactory);
    }

    @Override
    public Map<String, Object> apply(String s) {
        Path configurationFileLocation = Path.of(getResDir(), "test-suites" ,s.replace(".feature", TEST_FORM_FILE_EXTENSION));
        try {
            return YAML.load(new FileInputStream(configurationFileLocation.toFile()));
        } catch (FileNotFoundException e) {
            return Map.of();
        }
    }
}
