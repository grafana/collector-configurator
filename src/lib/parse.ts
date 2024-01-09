import { LineCounter, parseDocument, YAMLMap, Scalar, Pair } from "yaml";
import { JSONSchema7 } from "json-schema";

import raw_schema from "./schema.json";
import { NodeBase } from "yaml/dist/nodes/Node";
const schema = raw_schema as JSONSchema7;

export type ComponentType = "exporter" | "processor" | "receiver";

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

export function typeTitle(c: Component): string {
  return c.type.charAt(0).toUpperCase() + c.type.slice(1, -1);
}

function schemaFor(t: ComponentType, name: string): JSONSchema7 {
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
  if (!doc.contents) return c;
  (doc.contents as YAMLMap).items
    .filter((i) => (i.key as Scalar).value !== "service")
    .forEach((block) => {
      const ct = (block.key as Scalar).value as ComponentType;
      if (!block.value) return;
      if ((block.value as YAMLMap).items) {
        (block.value as YAMLMap).items.forEach((component) => {
          const cp = component as Pair;
          const name = (cp.key as Scalar).value as string;
          if (!name) {
            return;
          }
          const schema = schemaFor(ct, name);
          if (!schema.properties) {
            return;
          }

          const keyRange = {
            begin: lc.linePos((component.key as Scalar).range?.[0]!!),
            end: lc.linePos((component.key as Scalar).range?.[2]!!),
          };

          const value = (cp.value as YAMLMap).toJS(doc);

          const comp: Component = {
            name,
            schema,
            keyRange,
            value,
            type: ct,
          };

          let endNode: NodeBase = component.key as Scalar;
          if (
            component.value &&
            (component.value as YAMLMap).items &&
            (component.value as YAMLMap).items.length > 0
          ) {
            const items = (component.value as YAMLMap).items as Pair<
              unknown,
              NodeBase
            >[];
            const lastItem = items[items.length - 1].value;
            if (lastItem) endNode = lastItem;
            comp.valueRange = {
              begin: lc.linePos((component.value as NodeBase).range?.[0]!!),
              end: lc.linePos(endNode.range?.[1]!!),
            };
          }
          c.push(comp);
        });
      }
    });
  return c;
}
