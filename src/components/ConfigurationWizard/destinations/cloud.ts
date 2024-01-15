export const CloudDestination = (gatewayAddr: string, instanceID: string) => {
  return {
    metrics: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.metrics_receiver",
    },
    logs: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.logs_receiver",
    },
    traces: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.traces_receiver",
    },
    profiles: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.profiles_receiver",
    },
    template(): string {
      return ``;
    },
  };
};
