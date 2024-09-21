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

