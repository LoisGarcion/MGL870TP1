
Pour lancer le projet, il faut avoir docker et docker-compose installé sur la machine.
Aller à la racine du projet et faire :  docker-compose up --scale k6-client=0 --scale k6-banque=0
Pour lancer les tests : docker-compose up K6-client K6-banque

Adresse service client : http://localhost:8080/client/1
Adresse service banque : http://localhost:8081/banque/1
Adresse prometheus : http://localhost:9090
Adresse grafana : http://localhost:3000 (compte de base : user: "admin" password: "admin")
Adresse Jaeger : http://localhost:16686

La liste des dashboards est situé dans le dossier "dashboards" à la racine du projet.