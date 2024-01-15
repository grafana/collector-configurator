import { JSONSchema7 } from "json-schema";

export function formatTitle(title: string): string {
  return title
    .split("_")
    .map((w) => {
      switch (w) {
        case "id":
        case "url":
        case "ds":
        case "ca":
        case "tls":
        case "iis":
        case "otlp":
          return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export function cleanValues(values: any, schema: JSONSchema7): any {
  if (!values) return {};
  const v = values;
  for (const k of Object.keys(values)) {
    if (v[k] === (schema.properties?.[k] as JSONSchema7).default) {
      delete v[k];
    } else if (Number.isNaN(v[k])) {
      delete v[k];
    } else if ((schema.properties?.[k] as JSONSchema7).type === "object") {
      v[k] = cleanValues(v[k], schema.properties?.[k] as JSONSchema7);
      if (Object.keys(v[k]).length === 0) {
        delete v[k];
      }
    }
  }
  return v;
}
