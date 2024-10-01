const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');
const request = require('request');
const { loggerProvider } = require('./monitoring');
const opentelemetry = require('@opentelemetry/api');
const logsAPI = require('@opentelemetry/api-logs');

const logger = loggerProvider.getLogger('serviceClient');
// emit a log record
logger.emit({
    severityNumber: logsAPI.SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'this is a log record body',
    attributes: { 'log.type': 'LogRecord' },
});

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
        console.log('Server running on port 8080');
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'Le serveur est lancé sur le port 8080',
            attributes: { 'log.type': 'LogRecord' },
        });
    }
)

app.get("/client/:id", (req, res) => {
    //recuperer les info du client
    pool.query("SELECT * FROM client WHERE id = $1", [req.params.id], (error, results) => {
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'La requête client/:id a renvoyé une 200',
            attributes: { 'log.type': 'LogRecord' },
        });
        console.log("test");
        res.status(200).json(results.rows);
    })
});
app.get("/client/:id/releve", (req, res) => {
    //TODO verif que le client existe
    let infoClient;
    //fais une requete http vers localhost:8081/banque/:id pour récup les infos bancaires
    console.log("requete vers http://servicebanque:8081/banque/"+req.params.id)
    request('http://servicebanque:8081/banque/'+req.params.id, { json: true }, (err, resp, body) => {
        if (err) { return console.log(err); }
        if(resp.statusCode !== 200){
            res.status(404).json({error: "Client not found"});
        }

        //recupere les infos du client
        pool.query("SELECT * FROM client WHERE id = $1", [req.params.id], (error, results) => {
            infoClient = "relevé du client : nom: " + results.rows[0].nom + " prenom: " + results.rows[0].prenom + " compteCourant: " + body[0].comptecourant + " compteCredit: " + body[0].comptecredit;
            res.status(200).json(infoClient);
        });
    });
});

