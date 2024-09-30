const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');


const collectorOptions = {
    url: 'http://localhost:4318/v1/metrics', // URL vers laquelle les métriques sont envoyées
    headers: {},
    concurrencyLimit: 1
};
const exporter = new CollectorMetricExporter(collectorOptions);

const meter = new MeterProvider({
    exporter,
    interval:60000,
}).getMeter('meter-exemple');

const counter = meter.createCounter('metric_name_test');
counter.add(15, {'key': 'value'});

const requestCount = meter.createCounter("requests_count", {
    description: "Count all incoming requests"
});

const boundInstruments = new Map();

module.exports.countAllRequets = () => {
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