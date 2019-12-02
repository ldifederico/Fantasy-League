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
  
if (process.env.JAWSDB_URL) {
    db = new Database(process.env.JAWSDB_URL);
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

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/login.html"));
});

app.post("/", async function(req, res) {
    try {
        var companyidObj = await db.query(`SELECT companyId FROM user WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
        var useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
        var companyid = companyidObj[0].companyId;
        var userid = useridObj[0].id;
        console.log(companyid)
        if (companyid == null) 
            { res.send({userID: userid}) } 
        else { res.send({userID: userid, companyID: companyid}) ;}
    } catch(error) {
        res.send({text: "incorrect login"});
    }
});

app.get("/register", async function(req,res) {
    res.sendFile(path.join(__dirname, "./public/register.html"));
});

app.get("/main", async function(req,res) {
    res.sendFile(path.join(__dirname, "./public/main.html"));
});

app.post("/profile", async function(req,res) {
    userInfo = await db.query(`SELECT * FROM user WHERE id = ${req.body.userID}`);
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
        await db.query(`INSERT INTO user (firstName, lastName, email, username, password, points) VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.username}', '${req.body.password}', 0)`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}'`);
        userid = useridObj[0].id;
        res.send({text: userid});
    };
});

app.post("/group", async function (req, res) {
    group = await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID} ORDER BY points DESC`);
    res.json(group);
});

app.post("/searchGroup", async function(req,res) {
    let groupSearch = await db.query(`SELECT * FROM company WHERE name LIKE '%${req.body.groupName}%' `);
    res.json(groupSearch);
});

app.post("/joinGroup", async function(req,res) {
    var points = await startingPoints();
    await db.query(`UPDATE user SET user.companyId = ${req.body.companyID}, points = ${points} WHERE id = ${req.body.userID}`);
    let table = await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID}`);
    res.json(table);
});

app.post("/createGroup", async function(req,res) {
    let existCompany = await db.query(`SELECT * FROM company WHERE name = '${req.body.groupName}' `);
    if (existCompany[0] !== undefined){
        res.send("");
    } 
    else {
        await db.query(`INSERT INTO company (name) VALUES ('${req.body.groupName}')`);
        let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${req.body.groupName}'`);
        var companyID = companyidObj[0].id;
        var points = await startingPoints();
        await db.query(`UPDATE user SET user.companyId = ${companyID}, points = ${points} WHERE id = ${req.body.userID}`);
        res.json(companyID);
    };
});

app.post("/betHistory", async function(req, res) {
    let userBets = await db.query(`SELECT bet.fixture_id, bet.fixture, bet.team, bet.amountPlaced, bet.amountwon, bet.odds, bet.amountwon, bet.fixture_date, bet.score, user.username, company.name FROM bet LEFT JOIN user ON user.id = bet.user_Id LEFT JOIN company ON company.id = user.companyid WHERE user_Id = '${req.body.userID}' ORDER BY bet.fixture_date DESC`);
    res.json(userBets);
});

app.post("/placeBet", async function(req,res) {
    let userpoint = await db.query(`SELECT points FROM user WHERE id = '${req.body.userID}'`);
    if(userpoint[0].points >= req.body.amount){
        await db.query(`INSERT INTO bet (fixture, fixture_id, team, amountPlaced, odds, user_Id, fixture_date) VALUES( '${req.body.fixture}', ${req.body.fixtureID}, '${req.body.team}', ${req.body.amount}, ${req.body.odds}, ${req.body.userID}, '${req.body.date}')` );
        await db.query(`UPDATE user SET points = points - ${req.body.amount} WHERE id = ${req.body.userID}; `);
        status = "placed";
    }
    else{
        status = "no funds";
    };
    res.json(status);
});

app.post("/getPoints", async function(req,res) {
    let userpoint = await db.query(`SELECT points FROM user WHERE id = '${req.body.userID}'`);
    res.json(userpoint);
});

app.post("/updateUserProfile", async function(req,res) {
    let userID = req.body.userID;
    delete req.body.userID;
    //username existing check
    if (req.body.username !== undefined) {
        let existUser = await db.query(`SELECT * FROM user WHERE username = '${req.body.username}'`);
        if (existUser[0] !== undefined){
            res.send({text: "Username taken"});
            return;
        }
        else {
            query = `UPDATE USER SET`;
            for ([key, value] of Object.entries(req.body)) {
                query += ` ${key} = '${value}',`;
            };
            query = query.slice(0, -1)
            query += ` WHERE id = ${userID}`;
            let newUserInfo = await db.query(query);
        };
    };
});

app.post("/deleteAccount", async function(req,res) {
    await db.query(`DELETE FROM user WHERE id = '${req.body.userID}'`);
    await db.query(`DELETE FROM bet WHERE user_id = '${req.body.userID}'`);
});

async function startingPoints() {
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    let allFixtures = await axios(settings);
    var allFixturesCount = allFixtures.data.api.fixtures.length;
    var futureFixturesCount = 0;
    date_timestamp = Date.now().toString();
    date_timestamp = date_timestamp.slice(0,-3);
    for (fixture of Object.entries(allFixtures.data.api.fixtures)) {
        if (fixture[1].event_timestamp > date_timestamp) {
            futureFixturesCount++;
        };
    };
    var points = 1900 * (futureFixturesCount / allFixturesCount);
    return points;
}

async function checkGames() {

    var incompleteGames = [];
    var uniqueGames = [];
    var completedGames = [];
    let games = await db.query("SELECT fixture_id FROM bet WHERE winningTeam IS NULL ");
    if (games[0].fixture_id == !null) {
        for (i = 0; i < games.length; i++) {
            incompleteGames.push(games[i].fixture_id);
        };
        set = new Set(incompleteGames);
        unique = [...set];
        for (i = 0; i < unique.length; i++) {
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
                for (a = 0; a < bet_id.length; a++){
                    await db.query(`UPDATE bet SET winningTeam = '${game.result}' WHERE id = ${bet_id[a].id};`);
                    await db.query(`UPDATE bet SET amountwon = amountPlaced * odds WHERE id = ${bet_id[a].id} AND winningTeam = team`);
                    await db.query(`UPDATE bet SET amountwon = 0 WHERE id = ${bet_id[a].id} AND winningTeam != team`);
                };
                tempo = await db.query(`SELECT user_id, SUM(amountwon) FROM bet WHERE fixture_id = ${game.fixtureID} GROUP BY user_id;`);
                for(b = 0; b < tempo.length; b++){
                    await db.query(`UPDATE user SET points = points + ${tempo[b]['SUM(amountwon)']} WHERE id = ${tempo[b].user_id}`)
                };
            };
        };
    };
};

//Initial and 5-min interval database update for final game scores
checkGames();
setInterval(function () {checkGames()}, 300000);
