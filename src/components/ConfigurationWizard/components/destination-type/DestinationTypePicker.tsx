import { css } from "@emotion/css";
import { DestinationFormType } from "../../types/form";
import { DestinationType } from "./DestinationType";
interface DestinationTypePickerProps {
  onChange: (value: DestinationFormType) => void;
  selected: DestinationFormType;
}

const DestinationTypePicker = ({
  onChange,
  selected,
}: DestinationTypePickerProps) => {
  return (
    <>
      <div
        className={css`
          display: flex;
          direction: row;
          gap: 2em;
        `}
      >
        <DestinationType
          name="Cloud"
          value="cloud"
          icon="cloud"
          description="Send data to Grafana Cloud"
          onClick={onChange}
          selected={selected === "cloud"}
        />
        <DestinationType
          name="Local"
          value="local"
          icon="database"
          description="Send data to a local observability system"
          onClick={onChange}
          selected={selected === "local"}
        />
      </div>
    </>
  );
};
export default DestinationTypePicker;
