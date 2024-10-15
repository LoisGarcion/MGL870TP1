'use strict';
require('./traces');
const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
// const { ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');
const {
    ExponentialHistogramAggregation,
    MeterProvider,
    PeriodicExportingMetricReader,
    View,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
    SEMRESATTRS_SERVICE_NAME, ATTR_SERVICE_NAME,
} = require('@opentelemetry/semantic-conventions');

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const metricExporter = new OTLPMetricExporter({url: 'http://otel-collector:4318/v1/metrics'
    // headers: {
    //   foo: 'bar'
    // },
});

// Define view for the exponential histogram metric
const expHistogramView = new View({
    aggregation: new ExponentialHistogramAggregation(),
    // Note, the instrumentName is the same as the name that has been passed for
    // the Meter#createHistogram function for exponentialHistogram.
    instrumentName: 'test_exponential_histogram',
});

// Create an instance of the metric provider
const meterProvider = new MeterProvider({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: 'service_client_metric_service',
    }),
    views: [expHistogramView],
    readers: [new PeriodicExportingMetricReader({ exporter: metricExporter, exportIntervalMillis: 1000 })],
});

const meter = meterProvider.getMeter('service_client');

/*const requestCounter = meter.createCounter('request_counter', {
    description: 'Example of a Counter',
});*/

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
    description: 'Example of a UpDownCounter',
});

const histogram = meter.createHistogram('test_histogram', {
    description: 'Example of a Histogram',
});

/*const exponentialHistogram = meter.createHistogram('test_exponential_histogram', {
    description: 'Example of an ExponentialHistogram',
});*/

const counter200Request = meter.createCounter('http_request_valid', {
    description: 'Counter for HTTP 200 responses',
});

const counter500Request = meter.createCounter('http_request_error', {
    description: 'Counter for HTTP 500 responses',
});

const counter404Request = meter.createCounter('http_request_notfound', {
    description: 'Counter for HTTP 404 responses',
});

const requestDuration = meter.createHistogram('request_duration', {
    description: 'Histogram for the duration of requests',
    unit: 'milliseconds',
    boundaries: [10, 50, 100, 250, 500, 1000, 2500, 5000]  // Custom bucket boundaries in milliseconds
});


const attributes = { pid: process.pid, environment: 'staging' };

module.exports = {
    meter,
    counter200Request,
    counter500Request,
    counter404Request,
    requestDuration,
    attributes,
    //requestCounter
};

setInterval(() => {
    //requestCounter.add(1, attributes);
    upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
    histogram.record(Math.random(), attributes);
    //exponentialHistogram.record(Math.random(), attributes);
}, 1000);