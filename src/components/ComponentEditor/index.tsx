import { useForm } from "react-hook-form";
import { Component } from "../../lib/parse";
import { buildForm } from "../../lib/buildForm";
import { Button, HorizontalGroup } from "@grafana/ui";
import { JSONSchema7 } from "json-schema";

interface ComponentEditorProps {
  updateComponent: (component: Component) => void;
  discard: () => void;
  component: Component;
}

function setDefaultValues(values: any, schema: JSONSchema7): any {
  const v = values;
  for (const k of Object.keys(schema.properties ?? {})) {
    const ks = schema.properties!![k] as JSONSchema7;
    const t = ks.type!!;
    if (t !== "object") {
      if (!Object.hasOwn(v, k)) v[k] = ks.default;
    } else {
      const ov = setDefaultValues(v[k] ?? {}, ks);
      if (Object.keys(ov).length !== 0) v[k] = ov;
    }
  }
  return v;
}

const ComponentEditor = ({
  updateComponent,
  component,
  discard,
}: ComponentEditorProps) => {
  const formAPI = useForm({
    mode: "onSubmit",
    defaultValues: setDefaultValues(component.value ?? {}, component.schema),
    shouldFocusError: true,
  });
  const onSubmit = (data: any) => {
    component.value = data;
    updateComponent(component);
  };

  const { handleSubmit } = formAPI;

  return (
    <>
      {component.schema.description}
      <form onSubmit={handleSubmit(onSubmit)}>
        {buildForm(formAPI, component.schema)}
        <HorizontalGroup>
          <Button type="submit">Save</Button>
          <Button onClick={discard} variant="secondary">
            Discard
          </Button>
        </HorizontalGroup>
      </form>
    </>
  );
};

export default ComponentEditor;
