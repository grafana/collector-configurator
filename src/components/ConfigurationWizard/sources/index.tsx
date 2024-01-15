import { Source } from "../types/source";
import {
  LMBadge,
  LMTBadge,
  LBadge,
  MBadge,
  MTBadge,
  TBadge,
  EmptyBadge,
} from "./badges";
import { JSONSchema7, JSONSchema7Type } from "json-schema";
import metadata from "../../../lib/metadata.json";
import { formatTitle } from "../../../lib/utils";
import { TelemetryType } from "../types/telemetry";
import { buildForm } from "../../../lib/buildForm";

import raw_schema from "../../../lib/schema.json";
const recv_schema = raw_schema.properties.receivers.properties as Record<
  string,
  JSONSchema7Type
>;

interface stability {
  alpha?: TelemetryType[];
  beta?: TelemetryType[];
  stable?: TelemetryType[];
}

interface spec {
  status?: {
    stability: stability;
  };
}

const badgeFor = (supports: TelemetryType[]) => {
  if (supports.includes("logs")) {
    if (supports.includes("metrics")) {
      if (supports.includes("traces")) {
        return LMTBadge;
      }
      return LMBadge;
    }
    return LBadge;
  }
  if (supports.includes("metrics")) {
    if (supports.includes("traces")) {
      return MTBadge;
    }
    return MBadge;
  }
  if (supports.includes("traces")) {
    return TBadge;
  }
  return EmptyBadge;
};

const allSupports = (s: stability): TelemetryType[] => {
  const out: TelemetryType[] = [];
  if (s.alpha) {
    out.push(...s.alpha);
  }
  if (s.beta) {
    out.push(...s.beta);
  }
  if (s.stable) {
    out.push(...s.stable);
  }
  return out;
};

const Sources: Source[] = (() => {
  const sources: Source[] = [];
  for (const [k, v] of Object.entries(metadata)) {
    if (k.indexOf("receiver") === -1) continue;
    const s = (v as spec).status;
    if (!s) continue;
    const n = k.slice(0, -"receiver".length);
    const supports = allSupports(s.stability);
    const schema = recv_schema[n] as JSONSchema7;
    sources.push({
      label: formatTitle(n),
      value: n,
      supports,
      component: badgeFor(supports),
      advancedForm: ({ api }) => {
        return <div>{buildForm(api, schema, `${n}.` as const)}</div>;
      },
      schema: schema,
      imgUrl: "",
    });
  }
  return sources;
})();

export default Sources;
