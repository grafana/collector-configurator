.PHONY: clean-checkout
clean-checkout:
	# rm -rf opentelemetry-collector opentelemetry-collector-contrib
	# git clone 'https://github.com/open-telemetry/opentelemetry-collector' --depth=1
	# git clone 'https://github.com/open-telemetry/opentelemetry-collector-contrib' --depth=1


upstream.libsonnet: clean-checkout
	./collect-metadata.sh opentelemetry-collector > upstream.libsonnet

contrib.libsonnet: clean-checkout
	./collect-metadata.sh opentelemetry-collector-contrib > contrib.libsonnet

metadata.json: upstream.libsonnet contrib.libsonnet
	jsonnet metadata.jsonnet > metadata.json
