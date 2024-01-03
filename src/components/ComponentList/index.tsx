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
import { Component } from "../../lib/parse";

interface ComponentListProps {
  addComponent: (component: Component) => void;
}

type ListEntry = {
  name: string;
  title: string;
  meta: Array<string>;
  icon: IconName | `${string}.svg` | `${string}.png`;
  component: Component;
};

const components: ListEntry[] = [
  {
    name: "loki",
    title: "Send Logs",
    meta: ["Logging", "Loki", "Exporter"],
    icon: "cloud-upload",
    component: {
      type: "exporter",
      name: "loki",
      schema: {},
      value: {},
      keyRange: {
        begin: { line: 0, col: 0 },
        end: { line: 0, col: 0 },
      },
    },
  },
];

const ComponentList = ({ addComponent }: ComponentListProps) => {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    if (filter === "") return components;
    return components.filter(
      (c) =>
        c.name.includes(filter.toLowerCase()) ||
        c.title.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter]);
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
              <Card.Meta>{c.meta}</Card.Meta>
              <Card.Actions>
                <Button
                  onClick={() => {
                    faro.api?.pushEvent("added_component", {
                      component: c.name,
                    });
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
