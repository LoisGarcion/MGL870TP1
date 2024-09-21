const Pool = require('pg').Pool;
const cors = require('cors');
const express = require('express');

const pool = new Pool(
    {
        user:'..',
        host:'..',
        password:'..',
        database:'..',
        port:5433,
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
        res.status(200).json("user:...");
    }
)

