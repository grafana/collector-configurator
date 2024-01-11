const Examples: Array<{ name: string; source: string; logo: string }> = [
  {
    name: "OTLP",
    source: `# Learn more about the OpenTelemetry Collector via
# https://opentelemetry.io/docs/collector/

receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:

exporters:
  otlp:
    endpoint: otelcol:4317

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]

`,
    logo: `${process.env.PUBLIC_URL}/otel.png`,
  },
  {
    name: "Grafana Cloud",
    source: `# Learn more about the OpenTelemetry Collector via
# https://opentelemetry.io/docs/collector/

extensions:
  basicauth/grafana_cloud_tempo:
    # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/basicauthextension
    client_auth:
      username: "REPLACE_ME"
      password: "REPLACE ME"
  basicauth/grafana_cloud_prometheus:
    client_auth:
      username: "REPLACE ME"
      password: "REPLACE ME"
  basicauth/grafana_cloud_loki:
    client_auth:
      username: "REPLACE ME"
      password: "REPLACE ME"


receivers:
  otlp:
    # https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver
    protocols:
      grpc:
      http:
  hostmetrics:
    # Optional. Host Metrics Receiver added as an example of Infra Monitoring capabilities of the OpenTelemetry Collector
    # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver
    scrapers:
      load:
      memory:

processors:
  batch:
    # https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor
  resourcedetection:
    # Enriches telemetry data with resource information from the host
    # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/resourcedetectionprocessor
    detectors: ["env", "system"]
    override: false
  transform/add_resource_attributes_as_metric_attributes:
    # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor
    error_mode: ignore
    metric_statements:
      - context: datapoint
        statements:
          - set(attributes["deployment.environment"], resource.attributes["deployment.environment"])
          - set(attributes["service.version"], resource.attributes["service.version"])

exporters:
  otlp/grafana_cloud_traces:
    # https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter
    endpoint: "REPLACE_ME" # for example: "tempo-prod-10-prod-eu-west-2.grafana.net:443"
    auth:
      authenticator: basicauth/grafana_cloud_tempo

  loki/grafana_cloud_logs:
    # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/lokiexporter
    endpoint: "REPLACE_ME" # for example: "https://logs-prod-012.grafana.net/loki/api/v1/push"
    auth:
      authenticator: basicauth/grafana_cloud_loki

  prometheusremotewrite/grafana_cloud_metrics:
    # https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/prometheusremotewriteexporter
    endpoint: "REPLACE_ME" # for example: "https://prometheus-prod-24-prod-eu-west-2.grafana.net/api/prom/push"
    add_metric_suffixes: false
    auth:
      authenticator: basicauth/grafana_cloud_prometheus


service:
  extensions: [basicauth/grafana_cloud_tempo, basicauth/grafana_cloud_prometheus, basicauth/grafana_cloud_loki]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resourcedetection, batch]
      exporters: [otlp/grafana_cloud_traces]
    metrics:
      receivers: [otlp, hostmetrics]
      processors: [resourcedetection, transform/add_resource_attributes_as_metric_attributes, batch]
      exporters: [prometheusremotewrite/grafana_cloud_metrics]
    logs:
      receivers: [otlp]
      processors: [resourcedetection, batch]
      exporters: [loki/grafana_cloud_logs]
`,
    logo: `${process.env.PUBLIC_URL}/grafana.svg`,
  },
];
export default Examples;
