const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');
const { loggerProvider } = require('./monitoring');
const opentelemetry = require('@opentelemetry/api');
const logsAPI = require('@opentelemetry/api-logs');

const logger = loggerProvider.getLogger('serviceBanque');

const pool = new Pool(
    {
        user:'dbbanqueuser',
        host:'dbbanque',
        password:'dbbanquepassword',
        database:'dbb',
        port:5432,
    });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(
8081,
    () => {
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'Server running on port 8081',
            attributes: { 'log.type': 'LogRecord' },
        });
    }
)

app.get("/banque/:id", (req, res) => {
    //recuperer les info banquaire du client
    pool.query("SELECT * FROM banque WHERE idClient = $1", [req.params.id], (error, results) => {
        if(results.rows.length === 0) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.WARN,
                severityText: 'WARN',
                body: 'ROUTE : banque/' + req.params.id + ' SENT : 404, Banque account not found',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(404).json({error: "Banque account not found"});
        }
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'ROUTE : banque/' + req.params.id + ' SENT : 200 DATA : ' + JSON.stringify(results.rows[0]),
            attributes: { 'log.type': 'LogRecord' },
        });
        return res.status(200).json(results.rows);
    });
});

app.post("/banque/debit", (req, res) => {
    //check compte courant actuel
    pool.query("SELECT compteCourant FROM banque WHERE idClient = $1", [req.body.idClient], (error, results) => {
        if (error) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.ERROR,
                severityText: 'ERROR',
                body: 'ROUTE : banque/debit ERROR : ' + error,
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(400).json({error: "Erreur: " + error});
        }
        if (results.rowCount === 0) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.WARN,
                severityText: 'WARN',
                body: 'ROUTE : banque/debit SENT : 404 Bank account not found',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(404).json({message: "Bank account not found"});
        }
        if (parseInt(results.rows[0].comptecourant) < parseInt(req.body.valeurDebit)) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.INFO,
                severityText: 'INFO',
                body: 'ROUTE : banque/debit SENT : 400 Not enough money for debit',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(400).json({message: "Not enough money for debit"});
        }
        pool.query("UPDATE banque SET compteCourant = compteCourant - $1 WHERE idClient = $2", [req.body.valeurDebit, req.body.idClient], (error, results) => {
            if (error) {
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.ERROR,
                    severityText: 'ERROR',
                    body: 'ROUTE : banque/debit ERROR : ' + error,
                    attributes: { 'log.type': 'LogRecord' },
                });
                return res.status(400).json({error: "Error: " + error});
            }
            if (results.rowCount === 0) {
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.WARN,
                    severityText: 'WARN',
                    body: 'ROUTE : banque/debit SENT : 404 Bank account not found',
                    attributes: { 'log.type': 'LogRecord' },
                });
                return res.status(404).json({message: "Bank account not found"});
            }
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.INFO,
                severityText: 'INFO',
                body: 'ROUTE : banque/debit SENT : 200 Debit successful',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(200).json({message: "Debit successful"});
        });
    });
});

app.post("/banque/credit", (req, res) => {
    pool.query("UPDATE banque SET compteCredit = compteCredit + $1 WHERE idClient = $2", [req.body.valeurCredit, req.body.idClient], (error, results) => {
        if (error) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.ERROR,
                severityText: 'ERROR',
                body: 'ROUTE : banque/credit ERROR : ' + error,
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(400).json({error: "Error: " + error});
        }
        if (results.rowCount === 0) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.WARN,
                severityText: 'WARN',
                body: 'ROUTE : banque/credit SENT : 404 Bank account not found',
                attributes: { 'log.type': 'LogRecord' },
            });
            return res.status(404).json({message: "Bank account not found"});
        }
        logger.emit({
            severityNumber: logsAPI.SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'ROUTE : banque/credit SENT : 200 Credit successful',
            attributes: { 'log.type': 'LogRecord' },
        });
        return res.status(200).json({message: "Credit successful"});
    });
});

app.post("/banque/remboursement", (req, res) => {
    pool.query("SELECT compteCourant, compteCredit FROM banque WHERE idClient = $1", [req.body.idClient], (error, results) => {
        if (error) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.ERROR,
                severityText: 'ERROR',
                body: 'ROUTE : banque/remboursement ERROR : ' + error,
                attributes: {'log.type': 'LogRecord'},
            });
            return res.status(400).json({error: "Erreur: " + error});
        }
        if (results.rowCount === 0) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.WARN,
                severityText: 'WARN',
                body: 'ROUTE : banque/remboursement SENT : 404 Bank account not found',
                attributes: {'log.type': 'LogRecord'},
            });
            return res.status(404).json({message: "Bank account not found"});
        }
        if (parseInt(results.rows[0].comptecourant) < parseInt(req.body.valeurRemboursement)) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.INFO,
                severityText: 'INFO',
                body: 'ROUTE : banque/remboursement SENT : 400 Not enough money for refund',
                attributes: {'log.type': 'LogRecord'},
            });
            return res.status(400).json({message: "Not enough money for refund"});
        }
        if (parseInt(results.rows[0].comptecredit) < parseInt(req.body.valeurRemboursement)) {
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.INFO,
                severityText: 'INFO',
                body: "ROUTE : banque/remboursement SENT : 400 You can't refund more than you owe",
                attributes: {'log.type': 'LogRecord'},
            });
            return res.status(400).json({message: "You can't refund more than you owe"});
        }
        pool.query("UPDATE banque SET compteCredit = compteCredit - $1, compteCourant = compteCourant - $1 WHERE idClient = $2", [req.body.valeurRemboursement, req.body.idClient], (error, results) => {
            if (error) {
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.ERROR,
                    severityText: 'ERROR',
                    body: 'ROUTE : banque/remboursement ERROR : ' + error,
                    attributes: {'log.type': 'LogRecord'},
                });
                return res.status(400).json({error: "Error: " + error});
            }
            if (results.rowCount === 0) {
                logger.emit({
                    severityNumber: logsAPI.SeverityNumber.WARN,
                    severityText: 'WARN',
                    body: 'ROUTE : banque/remboursement SENT : 404 Bank account not found',
                    attributes: {'log.type': 'LogRecord'},
                });
                return res.status(404).json({message: "Bank account not found"});
            }
            logger.emit({
                severityNumber: logsAPI.SeverityNumber.INFO,
                severityText: 'INFO',
                body: 'ROUTE : banque/remboursement SENT : 200 Refund successful',
                attributes: {'log.type': 'LogRecord'},
            });
            return res.status(200).json({message: "Refund successful"});
        });
    });
});
