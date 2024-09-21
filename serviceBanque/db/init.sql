CREATE DATABASE  db_service_banque;

CREATE TABLE banque(
    idClient INT PRIMARY KEY,
    compteCourant INT,
    compteCredit INT
);

INSERT INTO banque VALUES(1, 1000, 500);
INSERT INTO banque VALUES(2, 2000, 0);