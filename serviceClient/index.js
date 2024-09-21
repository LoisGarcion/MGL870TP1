const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');

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
    }
)

app.get("/client/:id", (req, res) => {
        //recuperer les info du client
    pool.query("SELECT * FROM client WHERE id = $1", [req.params.id], (error, results) => {
        res.status(200).json(results);
    })
});

