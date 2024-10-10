const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { DiagConsoleLogger, DiagLogLevel, diag, metrics } = require('@opentelemetry/api');
const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const logsAPI = require('@opentelemetry/api-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const {LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter} = require("@opentelemetry/sdk-logs");
const {OTLPMetricExporter} = require("@opentelemetry/exporter-otlp-http");

//LOGS
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
// To start a logger, you first need to initialize the Logger provider.
const loggerProvider = new LoggerProvider();
// Add a processor to export log record
loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);

const logExporter = new OTLPLogExporter({url: 'http://otel-collector:4318/v1/logs'});
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter))
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()));
module.exports.loggerProvider = loggerProvider;

//METRICS
const collectorOptions = {
    url: 'http://otel-collector:4318/v1/metrics', // URL vers laquelle les métriques sont envoyées
    headers: {},
    concurrencyLimit: 1
};
const exporter = new OTLPMetricExporter({url: 'http://otel-collector:4318/v1/metrics'});

const meter = new MeterProvider(
    {
        exporter,
        interval:60000
    }
).getMeter('meter-exemple');

const counter = meter.createCounter('metric_name_test');
counter.add(15, {'key': 'value'});

const requestCount = meter.createCounter("requests_count", {
    description: "Count all incoming requests"
});

const boundInstruments = new Map();

module.exports.countAllRequests = () => {
    return (req, res, next) => {
        if (!boundInstruments.has(req.path)){
            const labels = {route: req.path};
            const boundCounter = requestCount.bind(labels);
            boundInstruments.set(req.path, boundCounter);
        }

        boundInstruments.get(req.path).add(1);
        next();
    };
};