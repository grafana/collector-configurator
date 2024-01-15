import { JSONSchema7 } from "json-schema";
import { AdvancedFormProps } from "./form";
import { TelemetryType } from "./telemetry";

export interface Source {
  value: string;
  label: string;
  imgUrl: string;
  supports: TelemetryType[];
  component: React.ComponentType;
  advancedForm?: (props: AdvancedFormProps) => JSX.Element;
  schema: JSONSchema7;
}
