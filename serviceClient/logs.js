require('./traces');
require('./metrics');
const logsAPI = require('@opentelemetry/api-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const {LoggerProvider, SimpleLogRecordProcessor} = require("@opentelemetry/sdk-logs");

const loggerProvider = new LoggerProvider();

const logExporter = new OTLPLogExporter({url: 'http://otel-collector:4318/v1/logs'});
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter))
module.exports.loggerProvider = loggerProvider;