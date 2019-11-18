const path = require('path');
const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
};
  
const db;
if (process.env.JAWSDB_URL) {
    db = mysql.createConnection(process.env.JAWSDB_URL);
} else {
    db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "FantasyDB"
  });
 }


var settings = {
    "method":"GET",
    "url":"",
    "headers":{
    "content-type":"application/octet-stream",
    "x-rapidapi-host":"api-football-v1.p.rapidapi.com",
    "x-rapidapi-key":"f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
    },"params":{
    "timezone":"Europe/London"
    }
};

companyList = [];
userList = [];
incompleteGames = [];
uniqueGames = [];
let userid;
let companyid;


app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/login.html"));
});

app.post("/", async function(req, res) {
    try {
        let companyidObj = await db.query(`SELECT companyId FROM user WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
        companyid = companyidObj[0].companyId;
        userid = useridObj[0].id;
        res.send({text: "correct login"})
    } catch(error) {
        res.send({text: "incorrect login"})
    }
});

app.get("/register", async function(req,res) {
    res.sendFile(path.join(__dirname, "./public/register.html"));
});

app.get("/main", async function(req,res) {
    res.sendFile(path.join(__dirname, "./public/main.html"));
});

app.get("/profile", async function(req,res) {
    userInfo = await db.query(`SELECT * FROM user WHERE id = ${userid}`);
    companyInfo = await db.query(`SELECT * FROM company WHERE id = ${userInfo[0].companyId}`);
    if (companyInfo[0] !== undefined) {
        userInfo[0].companyName = companyInfo[0].name
    }
    res.json(userInfo)
});

app.post("/register", async function(req,res) {
    let existUser = await db.query(`SELECT * FROM user WHERE username = '${req.body.username}' OR email = '${req.body.email}'`);
    if (existUser[0] !== undefined){
        res.send({text: "User exists"})
    }
    else {
        res.send({text: "User created"})
        await db.query(`INSERT INTO user (firstName, lastName, email, username, password, points) VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.username}', '${req.body.password}', 0)`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}'`);
        userid = useridObj[0].id;
    };
});

app.get("/group", async function (req, res) {
    if (companyid) {
        group = await db.query(`SELECT * FROM user WHERE companyid = ${companyid} ORDER BY points DESC`);
    }
    else {
        group = ""
    };
    res.json(group);
});

app.post("/searchGroup", async function(req,res) {
    let groupSearch = await db.query(`SELECT * FROM company WHERE name LIKE '%${req.body.groupName}%' `);
    res.json(groupSearch);
});

app.post("/joinGroup", async function(req,res) {
    await db.query(`UPDATE user SET user.companyId = ${req.body.companyID}, points = 2000 WHERE id = ${userid}`);
    companyid = req.body.companyID;
    let table = await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID}`);
    res.json(table);
});

app.post("/createGroup", async function(req,res) {
    let existCompany = await db.query(`SELECT * FROM company WHERE name = '${req.body.groupName}' `);
    if (existCompany[0] !== undefined){
        res.send("")
    } 
    else {
        await db.query(`INSERT INTO company (name) VALUES ('${req.body.groupName}')`);
        let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${req.body.groupName}'`);
        companyid = companyidObj[0].id;
        await db.query(`UPDATE user SET user.companyId = ${req.body.companyID}, points = 2000 WHERE id = ${userid}`);
        let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
        res.json(table)
    };
});

app.get("/betHistory", async function(req, res) {
    let userBets = await db.query(`SELECT bet.fixture_id, bet.fixture, bet.team, bet.amountPlaced, bet.amountwon, bet.odds, bet.amountwon, user.username, company.name FROM bet LEFT JOIN user ON user.id = bet.user_Id LEFT JOIN company ON company.id = user.companyid WHERE user_Id = '${userid}'`);
    res.json(userBets);
});

app.get("/main", async function(req,res) {
    let check = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);

    if (check[0] == undefined){
        console.log("You are not currently a part of any leagues please join or create one");
    }
    else{
        res.json(check);
    }
})

app.post("/placeBet", async function(req,res) {
    let userpoint = await db.query(`SELECT points FROM user WHERE id = '${userid}'`);
    if(userpoint[0].points>=req.body.amount){
        await db.query(`INSERT INTO bet (fixture, fixture_id, team, amountPlaced, odds, user_Id ) VALUES( '${req.body.fixture}', ${req.body.fixtureID}, '${req.body.team}', ${req.body.amount}, ${req.body.odds}, ${userid})` );
        await db.query(`UPDATE user SET points = points - ${req.body.amount} WHERE id = ${userid}; `)
        status = "placed"
    }
    else{
        status = "no funds"
    }
    res.json(status)
})

app.get("/getPoints", async function(req,res) {
    let userpoint = await db.query(`SELECT points FROM user WHERE id = '${userid}'`);
    res.json(userpoint)
})

async function checkGames() {

    var incompleteGames = [];
    var uniqueGames = [];
    var completedGames = [];
    let games = await db.query("SELECT fixture_id FROM bet WHERE winningTeam IS NULL ");
    if (games[0].fixture_id == !null) {
        for (i = 0; i<games.length; i++) {
            incompleteGames.push(games[i].fixture_id);
        }
        set = new Set(incompleteGames);
        unique = [...set];
        for (i = 0; i<unique.length; i++) {
            uniqueGames.push({fixtureID: unique[i], result: ""}); 
        };

        settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
        data = await axios(settings);
        seasonFixtures = data.data.api.fixtures;
        for (game of uniqueGames) {
            for (fixture of seasonFixtures) {
                if (game.fixtureID == fixture.fixture_id) {
                    if (fixture.goalsHomeTeam > fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: fixture.homeTeam.team_name})}
                    else if (fixture.goalsHomeTeam < fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: fixture.awayTeam.team_name})}
                    else if (fixture.goalsHomeTeam = fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: "Draw"})}
                };
            };
        };

        if (completedGames !== []) {
            for (game of completedGames) {
                bet_id =  await db.query(`SELECT id FROM bet WHERE fixture_id = ${game.fixtureID};`);
                for (a = 0; a<bet_id.length; a++){
                    await db.query(`UPDATE bet SET winningTeam = '${game.result}' WHERE id = ${bet_id[a].id};`);
                    await db.query(`UPDATE bet SET amountwon = amountPlaced * odds WHERE id = ${bet_id[a].id} AND winningTeam = team`);
                    await db.query(`UPDATE bet SET amountwon = 0 WHERE id = ${bet_id[a].id} AND winningTeam != team`);
                };
                tempo = await db.query(`SELECT user_id, SUM(amountwon) FROM bet WHERE fixture_id = ${game.fixtureID} GROUP BY user_id;`);
                for(b=0; b<tempo.length; b++){
                    await db.query(`UPDATE user SET points = points + ${tempo[b]['SUM(amountwon)']} WHERE id = ${tempo[b].user_id}`)
                };
            };
        };
    };
};

setInterval(function () {checkGames()}, 300000);
checkGames();
