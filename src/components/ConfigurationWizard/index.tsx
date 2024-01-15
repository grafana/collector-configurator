import { useModelContext } from "../../state";
import { WizardFormBasicValues } from "./types/form";
import { faro } from "@grafana/faro-web-sdk";
import BasicConfiguration from "./components/BasicConfiguration";
import { useState } from "react";
import AdvancedConfiguration from "./components/AdvancedConfiguration";
import YAML from "yaml";
import { cleanValues } from "../../lib/utils";

const ConfigurationWizard = ({ dismiss }: { dismiss: () => void }) => {
  const { setModel } = useModelContext();
  const [basicValues, setBasicValues] = useState<WizardFormBasicValues | null>(
    null,
  );
  const submitBasic = (data: WizardFormBasicValues) => {
    setBasicValues(data);
  };
  const submitAdvanced = (
    data: WizardFormBasicValues,
    advanced: Record<string, any>,
  ) => {
    const config: Record<string, any> = {};

    config["extensions"] = {
      health_check: {},
      pprof: {},
      zpages: {},
    };

    config["service"] = {
      extensions: ["health_check", "pprof", "zpages"],
      pipelines: {},
    };

    config["processors"] = {
      batch: {},
    };

    if (data.destination === "cloud" && data.cloud) {
      config["extensions"]["basicauth/grafanacloud"] = {
        client_auth: {
          username: data.cloud.instanceID,
          // eslint-disable-next-line no-template-curly-in-string
          password: "${env:GRAFANA_CLOUD_TOKEN}",
        },
      };
      config["exporters"] = {
        "otlphttp/grafanacloud": {
          endpoint: data.cloud.gatewayAddr,
          auth: {
            authenticator: "basicauth/grafanacloud",
          },
        },
      };
      (config["service"]["extensions"] as string[]).push(
        "basicauth/grafanacloud",
      );
    } else {
      config["exporters"] = {
        "otlphttp/backend": {
          endpoint: "https://your-endpoint:443",
        },
      };
    }
    config["service"]["pipelines"]["metrics"] = {
      receivers: [],
      processors: ["batch"],
      exporters: Object.keys(config["exporters"]),
    };
    config["service"]["pipelines"]["logs"] = {
      receivers: [],
      processors: ["batch"],
      exporters: Object.keys(config["exporters"]),
    };
    config["service"]["pipelines"]["traces"] = {
      receivers: [],
      processors: ["batch"],
      exporters: Object.keys(config["exporters"]),
    };

    config["receivers"] = {};
    for (const source of data.sources) {
      config["receivers"][source.value] = cleanValues(
        advanced[source.value],
        source.schema,
      );
      const supports = source.supports as string[];
      if (data.telemetry.metrics && supports.includes("metrics")) {
        (
          config["service"]["pipelines"]["metrics"]["receivers"] as string[]
        ).push(source.value);
      }
      if (data.telemetry.logs && supports.includes("logs")) {
        (config["service"]["pipelines"]["logs"]["receivers"] as string[]).push(
          source.value,
        );
      }
      if (data.telemetry.traces && supports.includes("traces")) {
        (
          config["service"]["pipelines"]["traces"]["receivers"] as string[]
        ).push(source.value);
      }
    }

    for (const t of ["metrics", "traces", "logs"]) {
      if (
        (config["service"]["pipelines"][t]["receivers"] as string[]).length ===
        0
      ) {
        delete config["service"]["pipelines"][t];
      }
    }
    setModel(YAML.stringify(config));
    dismiss();
    faro.api?.pushEvent("used_wizard", {
      destination: data.destination,
      telemetry: JSON.stringify(data.telemetry),
      sources: JSON.stringify(data.sources.map((x) => x.label)),
    });
  };
  return (
    <>
      {basicValues === null && (
        <BasicConfiguration onSubmit={submitBasic} dismiss={dismiss} />
      )}
      {basicValues !== null && (
        <AdvancedConfiguration
          onSubmit={submitAdvanced}
          dismiss={dismiss}
          basicValues={basicValues}
        />
      )}
    </>
  );
};

export default ConfigurationWizard;
