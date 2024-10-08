const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');
const request = require('request');
const { loggerProvider } = require('./monitoring');
const opentelemetry = require('@opentelemetry/api');
const logsAPI = require('@opentelemetry/api-logs');

const logger = loggerProvider.getLogger('serviceClient');

const tracer = opentelemetry.trace.getTracer(
    'Api service client',
    '0.1.0',
);

const pool = new Pool(
    {
        user:'dbclientuser',
        host:'dbclient',
        password:'dbclientpassword',
        database:'dbc',
        port:5432,
    });

const app = express();
app.use(cors());
app.use(express.json());

app.listen(
    8080,
    () => {
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'Server running on port 8080',
            attributes: { 'log.type': 'LogRecord' },
        });
    }
)

app.get("/client/:id", (req, res) => {
    //recuperer les info du client
    pool.query("SELECT * FROM client WHERE id = $1", [req.params.id], (error, results) => {
        if(error) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.ERROR,
                severityText: 'ERROR',
                body: 'ROUTE : client/' + req.params.id + ' ERROR : ' + error,
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(500).json({error: "Internal server error : " + error});
        }
        if(results.rows.length === 0) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.WARN,
                severityText: 'WARN',
                body: 'ROUTE : client/' + req.params.id + ' SENT : 404, Client not found',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(404).json({error: "Client not found"});
        }
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'ROUTE : client/' + req.params.id + ' SENT : 200 DATA : ' + JSON.stringify(results.rows[0]),
            attributes: { 'log.type': 'LogRecord' },
        });
        return res.status(200).json(results.rows);
    })
});
app.get("/client/:id/releve", (req, res) => {
    let infoClient;
    //fais une requete http vers localhost:8081/banque/:id pour récup les infos bancaires
    request('http://servicebanque:8081/banque/'+req.params.id, { json: true }, (err, resp, body) => {
        if (err) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.ERROR,
                severityText: 'ERROR',
                body: 'HTTP : servicebanque:8081/banque/' + req.params.id + ' ERROR : ' + err,
                attributes: { 'log.type': 'LogRecord' },
            })
            return res.status(500).json({error: "Internal server error : " + err});
        }
        if(resp.statusCode === 404){
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.WARN,
                severityText: 'WARN',
                body: 'HTTP : servicebanque:8081/banque/' + req.params.id + ' SENT : 404 Client not found',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(404).json({error: "Client not found"});
        }
        if(resp.statusCode === 200){
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.INFO,
                severityText: 'INFO',
                body: 'HTTP : servicebanque:8081/banque/' + req.params.id + ' SENT : 200 DATA : ' + JSON.stringify(body[0]),
                attributes: { 'log.type': 'LogRecord' },
            });
        }

        //recupere les infos du client
        pool.query("SELECT * FROM client WHERE id = $1", [req.params.id], (error, results) => {
            if(error) {
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.ERROR,
                    severityText: 'ERROR',
                    body: 'ROUTE : client/' + req.params.id + '/releve ERROR : ' + error,
                    attributes: { 'log.type': 'LogRecord' },
                });
                return res.status(500).json({error: "Internal server error : " + error});
            }
            if(results.rows.length === 0) {
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.WARN,
                    severityText: 'WARN',
                    body: 'ROUTE : client/' + req.params.id + ' SENT : 404 Client not found',
                    attributes: { 'log.type': 'LogRecord' },
                });
                return res.status(404).json({error: "Client not found"});
            }
            else {
                infoClient = "relevé du client : nom: " + results.rows[0].nom + " prenom: " + results.rows[0].prenom + " compteCourant: " + body[0].comptecourant + " compteCredit: " + body[0].comptecredit;
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.INFO,
                    severityText: 'INFO',
                    body: 'ROUTE : client/' + req.params.id + '/releve SENT : 200 DATA : ' + JSON.stringify(infoClient),
                    attributes: { 'log.type': 'LogRecord' },
                });
                return res.status(200).json(infoClient);
            }
        });
    });
});
app.get("/error", (req, res) => {
    //provoquer une erreur dans un try catch
    try{
        throw new Error('Ceci est une erreur');
    }
    catch (Exception){
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.ERROR,
            severityText: 'ERROR',
            body: 'ROUTE : client/error ERROR : ' + Exception,
            attributes: { 'log.type': 'LogRecord' },
        });
        return res.status(500).json({error: "Internal server error : " + Exception});
    }
});
