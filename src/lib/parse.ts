import { LineCounter, parseDocument, YAMLMap, Scalar, Pair } from "yaml";
import { JSONSchema7 } from "json-schema";

import raw_schema from "./schema.json";
import { NodeBase } from "yaml/dist/nodes/Node";
const schema = raw_schema as JSONSchema7;

export type ComponentType =
  | "exporter"
  | "processor"
  | "receiver"
  | "extension"
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
  (doc.contents as YAMLMap).items
    .filter((i) => (i.key as Scalar).value !== "service")
    .forEach((block) => {
      const parent = (block.key as Scalar).value as string;
      const ct = ((block.key as Scalar).value as string).slice(
        0,
        -1,
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
          keyRange: {
            begin: lc.linePos((block.key as Scalar).range?.[0]!!),
            end: lc.linePos((block.key as Scalar).range?.[2]!!),
          },
        });
      }
      if (!block.value) return;
      if ((block.value as YAMLMap).items) {
        (block.value as YAMLMap).items.forEach((component) => {
          const cp = component as Pair;
          const name = (cp.key as Scalar).value as string;
          if (!name) {
            return;
          }
          const schema = schemaFor(parent, name);
          if (!schema.properties) {
            return;
          }

          const value = (cp.value as YAMLMap).toJS(doc);

          const { keyRange, valueRange } = rangesFor(
            lc,
            cp as Pair<Scalar, YAMLMap>,
          );

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
