const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');

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

app.listen(
8081,
    () => {
        console.log('Server running on port 8081');
    }
)

app.get("/banque/:id", (req, res) => {
    //recuperer les info banquaire du client
    pool.query("SELECT * FROM banque WHERE idClient = $1", [req.params.id], (error, results) => {
        res.status(200).json(results.rows);
    });
});

app.post("/banque/debit", (req, res) => {
    //faire un debit
    //TODO ajouter une vérif sur le solde et sur l'id du client
    console.log("lancement debit");
    //marche pas jsp pourquoi
    pool.query("UPDATE banque SET compteCourant = compteCourant - $1 WHERE idClient = $2", [req.body.valeurDebit, req.body.idClient], (error, results) => {
        if(error){
            console.log(error);
            return res.status(400).json({error: "erreur " + error});
        }
        return res.status(200);
    });
});

app.post("/banque/credit", (req, res) => {
    //faire un credit
    //TODO ajouter une vérif sur l'id du client
    pool.query("UPDATE banque SET compteCredit = compteCredit - $1 WHERE idClient = $2", [req.body.valeurCredit, req.body.idClient], (error, results) => {
        res.status(200).json(results.rows);
    });
});

app.post("/banque/remboursement", (req, res) => {
//faire un remboursement
    //TODO ajouter une vérif sur l'id du client et sur le compte courant
    pool.query("UPDATE banque SET compteCredit = compteCredit - $1 AND compteCourant = compteCourant - $1 WHERE idClient = $2", [req.body.valeurRemboursement, req.body.idClient], (error, results) => {
        res.status(200).json(results.rows);
    });
});
