import { css } from "@emotion/css";
import { GrafanaTheme2, SelectableValue } from "@grafana/data";
import { IconButton, Select } from "@grafana/ui";
import { useState } from "react";
import { useComponentContext } from "../../../state";
import { useStyles } from "../../../theme";

const PipelineBuilder = ({
  name,
  entries,
  onChange,
}: {
  name: string;
  entries: string[];
  onChange: (entries: string[]) => void;
}) => {
  const { components } = useComponentContext();
  const opts = components
    .filter((c) => c.type === name.slice(0, -1))
    .map((c) => ({ label: c.name, value: c.name }));
  const styles = useStyles(getStyles);
  const [selectValue, setSelectValue] = useState<SelectableValue | null>(null);
  const onAdd = (val: string) => {
    if (!entries.includes(val)) {
      onChange(entries.concat(val));
    }
    setSelectValue(null);
  };

  const onDelete =
    (idx: number) => (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.preventDefault();
      const mod = entries.slice();
      mod.splice(idx, 1);
      onChange(mod);
    };
  const onUp =
    (idx: number) => (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.preventDefault();
      const mod = entries.slice();
      mod[idx] = entries[idx - 1];
      mod[idx - 1] = entries[idx];
      onChange(mod);
    };
  const onDown =
    (idx: number) => (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.preventDefault();
      const mod = entries.slice();
      mod[idx] = entries[idx + 1];
      mod[idx + 1] = entries[idx];
      onChange(mod);
    };
  return (
    <>
      <Select
        value={selectValue}
        onChange={(v) => {
          onAdd(v.value as string);
        }}
        allowCustomValue={true}
        placeholder="Select or enter name..."
        options={opts}
      />
      {entries.map((e, idx) => (
        <div className={styles.entry} key={e}>
          <span>{e}</span>
          <div className={styles.actions}>
            <IconButton
              name="arrow-up"
              aria-label="Move entry up"
              onClick={onUp(idx)}
              disabled={idx === 0}
            />
            <IconButton
              name="times"
              aria-label="Delete entry"
              onClick={onDelete(idx)}
            />
            <IconButton
              name="arrow-down"
              aria-label="Move entry down"
              disabled={idx === entries.length - 1}
              onClick={onDown(idx)}
            />
          </div>
        </div>
      ))}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    entry: css`
      background-color: ${theme.colors.background.secondary};
      margin-top: 0.5em;
      padding: 0.5em;
      display: flex;
      justify-content: space-between;
    `,
    actions: css`
      display: flex;
    `,
  };
};

export default PipelineBuilder;
