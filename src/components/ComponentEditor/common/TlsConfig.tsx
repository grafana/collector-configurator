import {
  FormAPI,
  InlineField,
  Input,
  TextArea,
  InlineSwitch,
} from "@grafana/ui";

const TlsConfig = ({
  methods,
  parent,
  disabled,
}: {
  methods: FormAPI<Record<string, any>>;
  parent: string;
  disabled?: boolean;
}) => {
  const commonOptions = {
    labelWidth: 25,
    disabled: disabled || false,
  };
  return (
    <>
      <InlineField
        label="CA PEM"
        tooltip="CA PEM-encoded text to validate the server with."
        {...commonOptions}
      >
        <TextArea {...methods.register(`${parent}.ca_pem` as const)} />
      </InlineField>
      <InlineField
        label="CA File"
        tooltip="Path to the CA file."
        {...commonOptions}
      >
        <Input {...methods.register(`${parent}.ca_file` as const)} />
      </InlineField>
      <InlineField
        label="TLS Certificate PEM"
        tooltip="Certificate PEM-encoded text"
        {...commonOptions}
      >
        <TextArea {...methods.register(`${parent}.cert_pem` as const)} />
      </InlineField>
      <InlineField
        label="TLS Certificate file"
        tooltip="Path to the TLS certificate."
        {...commonOptions}
      >
        <Input {...methods.register(`${parent}.cert_file` as const)} />
      </InlineField>
      <InlineField
        label="Key PEM"
        tooltip="PEM encoded key for the certificate."
        {...commonOptions}
      >
        <TextArea {...methods.register(`${parent}.key_pem` as const)} />
      </InlineField>
      <InlineField
        label="Key file"
        tooltip="Path to the certificate key"
        {...commonOptions}
      >
        <Input {...methods.register(`${parent}.key_file` as const)} />
      </InlineField>
      <InlineField
        label="Minimum TLS version"
        tooltip="Minimum acceptable TLS version for connections."
        {...commonOptions}
      >
        <Input
          {...methods.register(`${parent}.min_version` as const)}
          placeholder="TLS12"
        />
      </InlineField>
      <InlineField
        label="Server Name"
        tooltip="Verifies the hostname of server certificates when set."
        {...commonOptions}
      >
        <Input {...methods.register(`${parent}.server_name` as const)} />
      </InlineField>
      <InlineField
        label="Skip TLS verification"
        tooltip="Ignores insecure server TLS certificates."
        {...commonOptions}
      >
        <InlineSwitch
          {...methods.register(`${parent}.insecure_skip_verify` as const)}
        />
      </InlineField>
    </>
  );
};

export default TlsConfig;
