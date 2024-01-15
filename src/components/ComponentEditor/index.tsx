import { useForm } from "react-hook-form";
import { Component } from "../../lib/parse";
import { buildForm } from "../../lib/buildForm";
import { Button, HorizontalGroup } from "@grafana/ui";
import { css } from "@emotion/css";
import { setDefaultValues } from "../../lib/utils";

interface ComponentEditorProps {
  updateComponent: (component: Component) => void;
  discard: () => void;
  component: Component;
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
      <form
        className={css`
          max-width: 800px;
        `}
        onSubmit={handleSubmit(onSubmit)}
      >
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
