const { DiagConsoleLogger, DiagLogLevel, diag, metrics } = require('@opentelemetry/api');
const logsAPI = require('@opentelemetry/api-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const {LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter} = require("@opentelemetry/sdk-logs");

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