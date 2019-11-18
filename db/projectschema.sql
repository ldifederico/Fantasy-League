DROP DATABASE IF EXISTS FantasyDB;
CREATE database FantasyDB;
USE FantasyDB;

CREATE TABLE company(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE user(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    companyId INT,
    email VARCHAR(100),
    username VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    points INT
);

CREATE TABLE bet(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fixture VARCHAR(100),
    fixture_id INT NOT NULL,
    team VARCHAR(50),
    amountPlaced DECIMAL NOT NULL,
    odds DECIMAL,
    winningTeam VARCHAR(50),
    amountwon DECIMAL,
    user_Id INT NOT NULL
);


INSERT INTO company (name) VALUES ('Lip Service'), ('Night Owl LLP'), ('HitDaLiq Inc'), ('Phone Home Telecommunications');
INSERT INTO user (firstName, lastName, companyId, email, username, password, points) VALUES ('Idris', 'Adebisi', 1, 'idrisadebisi@lipservice.com', 'idrisxa', 'talktome',100 ),
('Linda', 'Di Federico', 1, 'lindifed@lipservice.com', 'lindifed', 'biggirltings',100 ),
('Patrick', 'Abromeit', 1, 'pabrome@lipservice.com', 'pabrome', 'middleman', 100 ),
('Kevin', 'Peterson', 2, 'kpeterson@nightowl.com', 'kpeterson', 'jerkmychicken', 100 ),
('Paul','McCartney', 2, 'paulmac@nightowl.com', 'paulmac', 'beetlejuice', 100),
('Steve', 'Jobs', 2, 'stevenjobless@nightowl.com', 'steven', 'keepthedocaway', 100),
('Ruth', 'Jones', 3, 'ruthisreal@hdl.com', 'ruthless', 'iamruthtou', 100),
('Brian', 'Kinder', 3, 'bkbkbk@hdl.com','boybetterknow','eggciting', 100),
('Chris', 'Benoit', 3, 'chrisbenoit@hdl.com', 'sharpshooter', 'wrestleania', 100),
('Billy', 'Bong', 4, 'billy@phonehome.com', 'commentcava', 'ouioiu22', 100),
('Alex', 'Ferguson', 4, 'alexfergie@phonehome.com', 'reddevils', 'fergietime', 100);

INSERT INTO bet (fixture, fixture_id, team, amountPlaced, odds, user_ID ) VALUES( 'Liverpool v City', 01, 'Liverpool', 10, 2, 1),
( 'Liverpool v City', 01, 'Liverpool', 100, 2, 3),
( 'Arsenal v Spurs', 30, 'Spurs', 100, 10, 2),
( 'Arsenal v Spurs', 30, 'Arsenal', 100, 5, 3),
( 'Aston Villa v Norwich City', 12, 'Aston Villa', 20, 50, 1);


