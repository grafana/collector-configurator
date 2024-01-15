import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import {
  Button,
  Checkbox,
  Field,
  Input,
  LinkButton,
  Modal,
  Toggletip,
  VerticalGroup,
} from "@grafana/ui";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useStyles } from "../../../theme";
import DestinationTypePicker from "../components/destination-type/DestinationTypePicker";
import SourcesInput from "../components/SourcesInput";
import { Step } from "../components/Step";
import { WizardFormDefaults, WizardFormBasicValues } from "../types/form";

const BasicConfiguration = ({
  onSubmit,
  dismiss,
}: {
  onSubmit: (data: WizardFormBasicValues) => void;
  dismiss: () => void;
}) => {
  const formAPI = useForm<WizardFormBasicValues>({
    mode: "onSubmit",
    defaultValues: WizardFormDefaults,
    shouldFocusError: true,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = formAPI;
  const destination = watch("destination");

  const styles = useStyles(getStyles);
  return (
    <FormProvider {...formAPI}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <Step
          title="Destination"
          stepNo={1}
          description="Where do you want to send your data?"
        >
          <Controller
            render={({ field: { ref, ...f } }) => (
              <DestinationTypePicker selected={f.value} onChange={f.onChange} />
            )}
            name="destination"
            defaultValue="cloud"
            control={control}
          />
          {destination === "cloud" && (
            <>
              <Field
                label="OTLP Endpoint"
                description="The OTLP endpoint URL of your Grafana Cloud stack"
                required
              >
                <Input
                  placeholder="https://otlp-gateway-prod-eu-west-2.grafana.net/otlp"
                  invalid={!!errors?.cloud?.gatewayAddr}
                  {...register("cloud.gatewayAddr", { required: true })}
                />
              </Field>
              <Field
                label="Instance ID"
                description="Your Grafana Cloud instance ID"
                required
              >
                <Input
                  placeholder="1337"
                  invalid={!!errors?.cloud?.instanceID}
                  {...register("cloud.instanceID", { required: true })}
                />
              </Field>

              <Toggletip
                title={<h4>Your OTLP Gateway Information</h4>}
                placement="right-start"
                fitContent
                content={
                  <>
                    <h6>1. Navigate to your account console</h6>
                    <p>
                      Visit{" "}
                      <a
                        href="https://grafana.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        grafana.com
                      </a>{" "}
                      and sign in or
                      <LinkButton
                        href="https://grafana.com/profile/org"
                        target="_blank"
                        fill="text"
                        icon="external-link-alt"
                      >
                        click here
                      </LinkButton>
                    </p>

                    <h6>2. Select the desired stack</h6>
                    <p>
                      Search for the stack you want to ingest data to and click
                      on <i>Details</i>
                    </p>
                    <h6>3. Select the OpenTelemetry Connection card</h6>
                    <p>
                      After clicking on <i>Configure</i> you will see your OTLP
                      Endpoint and instance ID
                    </p>
                    <img
                      src="otlp-config.png"
                      alt="Grafana management console showing the OTLP information for a stack"
                    />
                  </>
                }
              >
                <Button icon="question-circle" fill="text" variant="secondary">
                  Need help finding the correct information?
                </Button>
              </Toggletip>
            </>
          )}
        </Step>
        <Step
          title="Telemetry"
          stepNo={2}
          description="What kind of telemetry do you want to collect?"
        >
          <VerticalGroup>
            <Checkbox
              label="Metrics"
              description="Generate or Scrape prometheus metrics"
              {...register("telemetry.metrics")}
            />
            <Checkbox
              label="Logs"
              description="Collect logs from files or external systems"
              {...register("telemetry.logs")}
            />
            <Checkbox
              label="Traces"
              description="Receive traces from instrumented applications using the OpenTelemetry protocol"
              {...register("telemetry.traces")}
            />
          </VerticalGroup>
        </Step>
        <Step
          title="Sources"
          description="Which systems do you want to monitor? Select one or more!"
          stepNo={3}
        >
          <SourcesInput />
        </Step>
        <Modal.ButtonRow>
          <Button variant="secondary" fill="outline" onClick={dismiss}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(onSubmit)}>
            Next
          </Button>
        </Modal.ButtonRow>
      </form>
    </FormProvider>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    form: css`
      width: 100%;
    `,
  };
};
export default BasicConfiguration;
