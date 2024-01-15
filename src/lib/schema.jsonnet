local grpcOverride = {
  required: ['protocols'],
  properties+: {
    protocols+: {
      properties+: {
        grpc+: {
          type: 'object',
          default: {},
          properties: {
            endpoint: {
              type: 'string',
              default: '0.0.0.0:4137',
            },
          },
        },
        http+: {
          type: 'object',
          default: {},
          properties: {
            endpoint: {
              type: 'string',
              default: '0.0.0.0:4138',
            },
          },
        },
      },
    },
  },
};

(import 'upstream_schema.json') + {
  properties+: {
    receivers+: {
      patternProperties+: {
        '^otlp(/[^/]+)*$'+: grpcOverride,
      },
      properties+: {
        otlp+: grpcOverride,
      },
    },
  },
}
