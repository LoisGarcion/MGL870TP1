CREATE DATABASE  db_service_client;

CREATE TABLE client(
    id INT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100)
);

INSERT INTO client(id, nom, prenom) VALUES(1, 'DUPONT', 'Jean');
INSERT INTO client(id, nom, prenom) VALUES(2, 'DURAND', 'Paul');