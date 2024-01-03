import { InlineField, InlineSwitch, Input } from "@grafana/ui";
import { JSONSchema7 } from "json-schema";
import { UseFormReturn } from "react-hook-form";

export function buildForm(
  api: UseFormReturn,
  schema: JSONSchema7,
  parent: string = "",
): JSX.Element {
  let plain: { name: string; schema: JSONSchema7 }[] = [];
  let complex: { name: string; schema: JSONSchema7 }[] = [];
  for (const key of Object.keys(schema.properties ?? {})) {
    const ps = schema.properties![key] as JSONSchema7;
    switch (ps.type) {
      case "number":
      case "integer":
      case "boolean":
      case "string":
        plain.push({ name: key, schema: ps });
        break;
      case "object":
        complex.push({ name: key, schema: ps });
    }
  }
  return (
    <>
      {plain.map((f) => {
        let t = f.schema.type;
        const InputComponent = () => {
          switch (t) {
            case "number":
            case "integer":
              return (
                <Input
                  type="number"
                  {...api.register(parent + f.name, { valueAsNumber: true })}
                  placeholder={f.schema.default?.toString()}
                />
              );
            case "boolean":
              return <InlineSwitch {...api.register(parent + f.name)} />;
            default:
              return (
                <Input
                  type="text"
                  {...api.register(parent + f.name)}
                  placeholder={f.schema.default?.toString()}
                />
              );
          }
        };
        return (
          <InlineField
            label={formatTitle(f.name)}
            tooltip={f.schema.description}
            key={f.name}
            labelWidth={24}
          >
            <InputComponent />
          </InlineField>
        );
      })}
      {complex.map((f) => {
        return (
          <div key={f.name}>
            <h5>{formatTitle(f.name)}</h5>
            {buildForm(api, f.schema, `${parent}${f.name}.`)}
          </div>
        );
      })}
    </>
  );
}

function formatTitle(title: string): string {
  return title
    .split("_")
    .map((w) => {
      switch (w) {
        case "id":
        case "url":
          return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
