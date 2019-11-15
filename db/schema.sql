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
    password VARCHAR(100) NOT NULL
);

CREATE TABLE bet(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fixture VARCHAR(30),
    fixture_id INT NOT NULL,
    team VARCHAR(30),
    amountPlaced DECIMAL NOT NULL,
    odds DECIMAL,
    winningTeam VARCHAR(30),
    amountwon DECIMAL,
    user_Id INT NOT NULL
);


INSERT INTO company (name) VALUES ('Lip Service'), ('Night Owl LLP'), ('HitDaLiq Inc'), ('Phone Home Telecommunications');
INSERT INTO user (firstName, lastName, companyId, email, username, password) VALUES ('Idris', 'Adebisi', 1, 'idrisadebisi@lipservice.com', 'idrisxa', 'talktome' ),
('Linda', 'Di Federico', 1, 'lindifed@lipservice.com', 'lindifed', 'biggirltings' ),
('Patrick', 'Abromeit', 1, 'pabrome@lipservice.com', 'pabrome', 'middleman' ),
('Kevin', 'Peterson', 2, 'kpeterson@nightowl.com', 'kpeterson', 'jerkmychicken' ),
('Paul','McCartney', 2, 'paulmac@nightowl.com', 'paulmac', 'beetlejuice'),
('Steve', 'Jobs', 2, 'stevenjobless@nightowl.com', 'steven', 'keepthedocaway'),
('Ruth', 'Jones', 3, 'ruthisreal@hdl.com', 'ruthless', 'iamruthtou'),
('Brian', 'Kinder', 3, 'bkbkbk@hdl.com','boybetterknow','eggciting'),
('Chris', 'Benoit', 3, 'chrisbenoit@hdl.com', 'sharpshooter', 'wrestleania'),
('Billy', 'Bong', 4, 'billy@phonehome.com', 'commentcava', 'ouioiu22'),
('Alex', 'Ferguson', 4, 'alexfergie@phonehome.com', 'reddevils', 'fergietime');

INSERT INTO bet (fixture, fixture_id, team, amountPlaced, odds, user_ID ) VALUES( 'Liverpool v City', 01, 'Liverpool', 10, 2, 1),
( 'Liverpool v City', 01, 'Liverpool', 100, 2, 3),
( 'Arsenal v Spurs', 30, 'Spurs', 100, 10, 2),
( 'Arsenal v Spurs', 30, 'Arsenal', 100, 5, 3),
( 'Aston Villa v Norwich City', 12, 'Aston Villa', 20, 50, 1);