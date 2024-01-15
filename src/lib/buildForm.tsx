import { css } from "@emotion/css";
import { Alert, InlineField, InlineSwitch, Input, Label } from "@grafana/ui";
import { JSONSchema7 } from "json-schema";
import { Controller, UseFormReturn } from "react-hook-form";
import PipelineBuilder from "../components/ComponentEditor/components/pipelinebuilder";
import { formatTitle } from "./utils";

export function buildForm(
  api: UseFormReturn,
  schema: JSONSchema7,
  parent: string = "",
): JSX.Element {
  let plain: { name: string; schema: JSONSchema7 }[] = [];
  let complex: { name: string; schema: JSONSchema7 }[] = [];
  let array: { name: string; schema: JSONSchema7 }[] = [];
  for (const key of Object.keys(schema.properties ?? {})) {
    const ps = schema.properties![key] as JSONSchema7;
    switch (ps.type) {
      case "number":
      case "integer":
      case "boolean":
      case "string":
        plain.push({ name: key, schema: ps });
        break;
      case "array":
        array.push({ name: key, schema: ps });
        break;
      case "object":
        if (key !== "resource_attributes" && key !== "metrics")
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
      {array.map((f) => {
        if (!["receivers", "processors", "exporters"].includes(f.name)) {
          return (
            <div key={f.name}>
              <h5>{formatTitle(f.name)}</h5>
              <Alert title={`Property '${f.name}' currently unsupported`} />
            </div>
          );
        }
        return (
          <div
            key={f.name}
            className={css`
              margin-bottom: 2em;
            `}
          >
            <h5>{formatTitle(f.name)}</h5>
            <Controller
              name={f.name}
              control={api.control}
              render={({ field: { ref, ...field } }) => (
                <PipelineBuilder {...field} entries={field.value ?? []} />
              )}
            />
            <hr />
          </div>
        );
      })}
      {complex.map((f) => {
        return (
          <div key={f.name}>
            {parent === "" && <h5>{formatTitle(f.name)}</h5>}
            {parent !== "" && (
              <Label
                category={
                  parent !== ""
                    ? formatTitle(parent.slice(0, -1), ".").split(" ")
                    : []
                }
                children={formatTitle(f.name)}
              />
            )}
            <div
              className={css`
                padding-left: 1em;
              `}
            >
              {buildForm(api, f.schema, `${parent}${f.name}.`)}
            </div>
          </div>
        );
      })}
    </>
  );
}
