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
    amount_placed DECIMAL NOT NULL,
    odds DECIMAL,
    amount_won INT NOT NULL,
    user_ID INT NOT NULL
);