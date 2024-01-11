import {
  Card,
  Button,
  LinkButton,
  Icon,
  IconName,
  Input,
  Field,
} from "@grafana/ui";
import { useMemo, useState } from "react";
import { faro } from "@grafana/faro-web-sdk";
import { Component, ComponentType } from "../../lib/parse";

import raw_schema from "../../lib/schema.json";
import { JSONSchema7 } from "json-schema";
import { formatTitle } from "../../lib/utils";
const schema = raw_schema as JSONSchema7;

interface ComponentListProps {
  addComponent: (component: Component) => void;
  section: Component;
}

type ListEntry = {
  name: string;
  title: string;
  icon: IconName | `${string}.svg` | `${string}.png`;
  component: Component;
};

const components: ListEntry[] = (() => {
  const cmpnts: ListEntry[] = [];
  for (const cat of Object.keys(schema.properties ?? {})) {
    const ct = cat.slice(0, -1) as ComponentType;
    if (!["exporter", "receiver", "processor", "extension"].includes(ct)) {
      continue;
    }
    for (const cmpMatch of Object.keys(
      (schema.properties?.[cat] as JSONSchema7).patternProperties ?? {},
    )) {
      if (cmpMatch === "additionalProperties") continue;
      const name = cmpMatch.slice(
        cmpMatch.indexOf("^") + 1,
        cmpMatch.indexOf("(") !== -1 ? cmpMatch.indexOf("(") : cmpMatch.length,
      );
      const cschema =
        ((schema.properties?.[cat] as JSONSchema7).patternProperties?.[
          cmpMatch
        ] as JSONSchema7) ?? {};
      cmpnts.push({
        name,
        title: formatTitle(name),
        icon: ct === "exporter" ? "cloud-upload" : "apps",
        component: {
          name: name,
          type: ct,
          schema: cschema,
          value: {},
          keyRange: {
            begin: { line: 0, col: 0 },
            end: { line: 0, col: 0 },
          },
        },
      });
    }
  }
  return cmpnts;
})();

const pipelineComponents: ListEntry[] = [
  {
    name: "logs",
    title: "Logs",
    icon: "gf-logs",
    component: {
      name: "logs",
      type: "pipeline",
      schema: raw_schema.properties.service.properties.pipelines.properties
        .logs as JSONSchema7,
      value: {},
      keyRange: {
        begin: { line: 0, col: 0 },
        end: { line: 0, col: 0 },
      },
    },
  },
  {
    name: "metrics",
    title: "Metrics",
    icon: "graph-bar",
    component: {
      name: "metrics",
      type: "pipeline",
      schema: raw_schema.properties.service.properties.pipelines.properties
        .metrics as JSONSchema7,
      value: {},
      keyRange: {
        begin: { line: 0, col: 0 },
        end: { line: 0, col: 0 },
      },
    },
  },
  {
    name: "traces",
    title: "Traces",
    icon: "message",
    component: {
      name: "traces",
      type: "pipeline",
      schema: raw_schema.properties.service.properties.pipelines.properties
        .traces as JSONSchema7,
      value: {},
      keyRange: {
        begin: { line: 0, col: 0 },
        end: { line: 0, col: 0 },
      },
    },
  },
];

const ComponentList = ({ addComponent, section }: ComponentListProps) => {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const categorized = (
      section.name === "pipeline" ? pipelineComponents : components
    ).filter((c) => c.component.type === section.name);
    if (filter === "") return categorized;
    return categorized.filter(
      (c) =>
        c.name.includes(filter.toLowerCase()) ||
        c.title.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter, section]);
  return (
    <>
      <Field label="Search components">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
          prefix={<Icon name="search" />}
          required
        />
      </Field>
      <section>
        {filtered.map((c) => {
          return (
            <Card key={c.name + c.title}>
              <Card.Heading>{c.title}</Card.Heading>
              <Card.Figure>
                {!c.icon.includes(".") && (
                  <Icon size="xxxl" name={c.icon as IconName} />
                )}
                {c.icon.includes(".") && (
                  <img src={c.icon} alt={`Icon representing ${c.title}`} />
                )}
              </Card.Figure>
              <Card.Actions>
                <Button
                  onClick={() => {
                    faro.api?.pushEvent("added_component", {
                      component: c.name,
                    });
                    addComponent(c.component);
                  }}
                >
                  Add
                </Button>
                <LinkButton
                  variant="secondary"
                  href={`https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/${c.component.type}/${c.name}${c.component.type}`}
                  target="_blank"
                >
                  Documentation
                </LinkButton>
              </Card.Actions>
            </Card>
          );
        })}
      </section>
    </>
  );
};

export default ComponentList;
