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

local basicAuthOverride = {
  properties+: {
    client_auth+: {
      type: 'object',
      description: 'Username & Password authentiction',
      properties: {
        username: {
          type: 'string',
          default: '',
        },
        password: {
          type: 'string',
          default: '',
        },
      },
    },
    htpasswd+: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'The path to the htpasswd file',
          default: '',
        },
        inline: {
          type: 'string',
          description: 'The htpasswd file inline content',
          default: '',
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
    extensions+: {
      patternProperties+: {
        '^basicauth(/[^/]+)*$'+: basicAuthOverride,
      },
      properties+: {
        basicauth+: basicAuthOverride,
      },
    },
  },
}
