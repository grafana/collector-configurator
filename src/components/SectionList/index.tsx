import {
  Card,
  Button,
  LinkButton,
  Icon,
  IconName,
  Input,
  Field,
} from "@grafana/ui";
import { Component, ComponentType } from "../../lib/parse";

import raw_schema from "../../lib/schema.json";
import { JSONSchema7 } from "json-schema";
import { useComponentContext } from "../../state";
import { formatTitle } from "../../lib/utils";
import { css } from "@emotion/css";
const schema = raw_schema as JSONSchema7;

const SectionList = ({
  insertSection,
}: {
  insertSection: (section: string) => void;
}) => {
  const { components } = useComponentContext();
  let present = components
    .filter((c) => c.type === "section")
    .map((c) => c.name);
  const sections: { key: string; value: JSONSchema7 }[] = [];
  for (const name of Object.keys(schema.properties ?? {})) {
    const ct = name.slice(0, -1);
    if (!present.includes(ct)) {
      sections.push({
        key: name,
        value: schema.properties?.[name] as JSONSchema7,
      });
    }
  }
  return (
    <div
      className={css`
        display: flex;
        gap: 20px;
      `}
    >
      {sections.map((s) => (
        <Card
          key={s.key}
          className={css`
            width: 380px !important;
            cursor: pointer;
            user-select: none;
          `}
          onClick={() => insertSection(s.key)}
        >
          <Card.Heading>{s.value.title ?? formatTitle(s.key)}</Card.Heading>
          <Card.Description>{s.value.description}</Card.Description>
        </Card>
      ))}
    </div>
  );
};

export default SectionList;
