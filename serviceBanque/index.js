const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');

const pool = new Pool(
    {
        user:'..',
        host:'..',
        password:'..',
        database:'..',
        port:5432,
    });

const app = express();
app.use(cors());
app.use(express.json());

app.listen(
8081,
    () => {
        console.log('Server running on port 8080');
    }
)

app.get("/banque/:id", (req, res) => {
    //recuperer les info banquaire du client
res.status(200).json("banque:...");
}
)

