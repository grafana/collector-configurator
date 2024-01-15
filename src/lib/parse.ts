import {
  LineCounter,
  parseDocument,
  YAMLMap,
  Scalar,
  Pair,
  Document,
  Node,
} from "yaml";
import { JSONSchema7 } from "json-schema";

import raw_schema from "./schema.json";
import { NodeBase } from "yaml/dist/nodes/Node";
const schema = raw_schema as JSONSchema7;

export type ComponentType =
  | "exporter"
  | "processor"
  | "receiver"
  | "extension"
  | "pipeline"
  | "section";

export interface Pos {
  line: number;
  col: number;
}
export interface Range {
  begin: Pos;
  end: Pos;
}

export interface Component {
  type: ComponentType;
  name: string;
  schema: JSONSchema7;
  value: Object;
  keyRange: Range;
  valueRange?: Range;
}

export function typeTitle(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function schemaFor(t: string, name: string): JSONSchema7 {
  if (!name || !schema.properties?.[t]) {
    return {};
  }
  const cat = schema.properties?.[t] as JSONSchema7;
  for (const pat of Object.keys(cat.patternProperties ?? {})) {
    if (name.match(pat)) {
      return cat.patternProperties?.[pat] as JSONSchema7;
    }
  }
  return {};
}

export function parseConfig(model: string) {
  let c: Component[] = [];
  const lc = new LineCounter();
  const doc = parseDocument(model, { lineCounter: lc });
  if (!doc.contents || !(doc.contents as YAMLMap).items) return c;
  const knownTopLevel = Object.keys(schema.properties ?? {});
  (doc.contents as YAMLMap).items
    .filter((i) => knownTopLevel.includes((i.key as Scalar).value as string))
    .forEach((block) => {
      if (!(block.key as Scalar).value) return;
      const parent = (block.key as Scalar).value as string;
      const ct = (
        parent === "service" ? parent : parent.slice(0, -1)
      ) as ComponentType;
      {
        const { keyRange, valueRange } = rangesFor(
          lc,
          block as Pair<Scalar, YAMLMap>,
        );
        c.push({
          type: "section",
          name: ct,
          schema: {},
          value: {},
          keyRange,
          valueRange,
        });
      }
      if (!block.value) return;
      if ((block.value as YAMLMap).items) {
        (block.value as YAMLMap).items.forEach((component) => {
          const cp = component as Pair;
          if (!cp.key) return;
          const name = (cp.key as Scalar).value as string;
          if (!name) {
            return;
          }

          const { keyRange, valueRange } = rangesFor(
            lc,
            cp as Pair<Scalar, YAMLMap>,
          );

          if (name === "pipelines") {
            c.push(...parsePipelines(lc, cp.value as YAMLMap, doc));
            c.push({
              name: "pipeline",
              keyRange,
              valueRange,
              schema: {},
              value: {},
              type: "section",
            });
            return;
          }

          const schema = schemaFor(parent, name);
          if (!schema.properties) {
            return;
          }
          const value = (cp.value as YAMLMap).toJS(doc);

          const comp: Component = {
            name,
            schema,
            keyRange,
            valueRange,
            value,
            type: ct,
          };

          c.push(comp);
        });
      }
    });
  return c;
}

function rangesFor(lc: LineCounter, m: Pair<Scalar, YAMLMap>) {
  const r: { keyRange: Range; valueRange?: Range } = {
    keyRange: {
      begin: lc.linePos(m.key.range?.[0]!!),
      end: lc.linePos(m.key.range?.[2]!!),
    },
  };
  if (m.value && m.value.items && m.value.items.length > 0) {
    let endNode: NodeBase = m.key;
    const items = m.value.items as Pair<unknown, NodeBase>[];
    const lastItem = items[items.length - 1].value;
    if (lastItem) endNode = lastItem;
    r.valueRange = {
      begin: lc.linePos(m.value.range?.[0]!!),
      end: lc.linePos(endNode.range?.[1]!!),
    };
  }
  return r;
}

function parsePipelines(
  lc: LineCounter,
  block: YAMLMap,
  doc: Document<Node, boolean>,
): Component[] {
  if (!block) return [];
  const pipelines: Component[] = [];
  if (!block.items) return [];
  for (const k of block.items) {
    const name = (k.key as Scalar).value as string;
    const { keyRange, valueRange } = rangesFor(lc, k as Pair<Scalar, YAMLMap>);
    const value = (k.value as YAMLMap).toJS(doc);
    pipelines.push({
      name,
      type: "pipeline",
      schema: (
        raw_schema.properties.service.properties.pipelines as JSONSchema7
      ).properties?.[name.split("/")[0]] as JSONSchema7,
      keyRange,
      value,
      valueRange,
    });
  }
  return pipelines;
}
