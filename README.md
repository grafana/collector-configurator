<h1><img src="public/otel.png" height="64">OTel Collector Configurator Tool</h1>

<h3 align="center">🌐 <a href="https://grafana.github.io/collector-configurator/">⟹ Visit the configurator here ⟸</a> 🌐</h3>

The _Collector Configuration Generator_ is an easy to use web interface for creating and editing OpenTelemetry Collector configuration files.

It also allows you to build a new configuration from scratch by following a configuration wizard

## Features

### Edit your configuration without worrying about YAML

https://github.com/grafana/collector-configurator/assets/1364576/6575f40a-9deb-40c1-ab4f-4d403aaeba68


### Build a new configuration from scratch

https://github.com/grafana/collector-configurator/assets/1364576/6810918b-f8ac-4b6e-a882-e1a0d550e2f7


## Development setup

1. Run `npm install` to install all dependencies.
   * Due to incompatibilities in react dependencies, you need to use `--force` to avoid a dependency conflict
2. Run `npm start` to start the server.
3. Access the configuration generator on [localhost:3000](localhost:3000).
