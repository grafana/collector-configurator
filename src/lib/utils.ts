import { JSONSchema7 } from "json-schema";

export function formatTitle(title: string, sep: string = "_"): string {
  return title
    .split(sep)
    .map((w) => {
      switch (w) {
        case "id":
        case "url":
        case "ds":
        case "ca":
        case "tls":
        case "iis":
        case "grpc":
        case "http":
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
    const s = schema.properties?.[k] as JSONSchema7;
    if (v[k] === s.default) {
      delete v[k];
    } else if (Number.isNaN(v[k])) {
      delete v[k];
    } else if (s.type === "string" && !s.default && v[k] === "") {
      delete v[k];
    } else if (s.type === "object") {
      if (v[k]) v[k] = cleanValues(v[k], s);
      if (Object.keys(v[k]).length === 0) {
        if (!s.default || Object.keys(s.default).length !== 0) delete v[k];
      }
    }
  }
  return v;
}

export function setDefaultValues(values: any, schema: JSONSchema7): any {
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
