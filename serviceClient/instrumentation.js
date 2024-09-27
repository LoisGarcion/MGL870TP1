const logsAPI = require('@opentelemetry/api-logs');
const {
    LoggerProvider,
    SimpleLogRecordProcessor,
    ConsoleLogRecordExporter, BatchLogRecordProcessor,
} = require('@opentelemetry/sdk-logs');
const {OTLPLogExporter} = require("@opentelemetry/exporter-logs-otlp-http");

// To start a logger, you first need to initialize the Logger provider.
const loggerProvider = new LoggerProvider();
// Add a processor to export log record
loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);

const collectorOptions = {
    url: '<http://localhost:4318/v1/logs>', // url is optional and can be omitted - default is http://localhost:4318/v1/logs
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 1, // an optional limit on pending requests
};

const logExporter = new OTLPLogExporter(collectorOptions);

loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

// You can also use global singleton
logsAPI.logs.setGlobalLoggerProvider(loggerProvider);
const logger = logsAPI.logs.getLogger('default');

module.exports = logsAPI;