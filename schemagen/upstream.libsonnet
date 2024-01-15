{
  'batchprocessor': std.parseYaml(importstr 'opentelemetry-collector/processor/batchprocessor/metadata.yaml'),
  'memorylimiterprocessor': std.parseYaml(importstr 'opentelemetry-collector/processor/memorylimiterprocessor/metadata.yaml'),
  'otlpreceiver': std.parseYaml(importstr 'opentelemetry-collector/receiver/otlpreceiver/metadata.yaml'),
  'debugexporter': std.parseYaml(importstr 'opentelemetry-collector/exporter/debugexporter/metadata.yaml'),
  'loggingexporter': std.parseYaml(importstr 'opentelemetry-collector/exporter/loggingexporter/metadata.yaml'),
  'otlpexporter': std.parseYaml(importstr 'opentelemetry-collector/exporter/otlpexporter/metadata.yaml'),
  'otlphttpexporter': std.parseYaml(importstr 'opentelemetry-collector/exporter/otlphttpexporter/metadata.yaml'),
}
