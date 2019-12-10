const path = require('path');
const express = require('express');
const mysql = require('mysql');
const axios = require('axios');
const sha256 = require('js-sha256');
const nodemailer = require('nodemailer');
const jwt = require('jwt-simple');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'coleageassistance@gmail.com',
      pass: 'middleman'
    }
});
  
var mailOptions = {
    from: 'coleageassistance@gmail.com',
    to: '',
    subject: "Password reset",
    text: "Hello! You've requested to reset your password. Please click the link below to reset your password."
};

companyList = [];
userList = [];
incompleteGames = [];
uniqueGames = [];

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});

app.post("/verification", async function(req,res) {
    console.log(req.body);
    try {
        await db.query(`SELECT id FROM user WHERE id = ${req.body.userID}`)
        res.send("verified")
    }
    catch {
        res.send("not verfied")
    }
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/login.html"));
});

app.post("/", async function(req, res) {
    try {
        var response = {};
        var userInfo = await db.query(`SELECT id, companyId, deduction_notification FROM user WHERE username = '${req.body.username}' AND password = '${sha256(req.body.password)}'`);
        console.log(userInfo)
        response.userID = userInfo[0].id;
        if (userInfo[0].companyId !== null) { response.companyID = userInfo[0].companyId } 
        if (userInfo[0].deduction_notification !== null && userInfo[0].deduction_notification !== 0) { response.deductions = userInfo[0].deduction_notification }
        res.send(response);
    } catch(error) {
        res.send({text: "incorrect login"});
    };
});

app.post("/pointpenalty", async function (req, res) {
    console.log(req.body);
    db.query(`UPDATE user SET deduction_notification = 0 WHERE id = ${req.body.userID} `);
    res.send("cleared");
});

app.get("/register", async function(req,res) {
    res.sendFile(path.join(__dirname, "./public/register.html"));
});

app.post("/forgotUsername", async function(req,res) {
    var username = await db.query(`SELECT username FROM user WHERE email = '${req.body.email}'`)
    mailOptions.to = req.body.email;
    mailOptions.subject = "Forgot username";
    mailOptions.text = `Hello! Your username is: ${username[0].username}`;
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
});

app.post("/forgotPassword", async function(req,res) {
    var userInfo = await db.query(`SELECT id, password FROM user WHERE email = "${req.body.email}"`)
    var payload = {
        userID: userInfo[0].id,
        email: req.body.email
    };
    var secret = userInfo[0].password;
    console.log(secret)
    var token = jwt.encode(payload,secret);
    if (process.env.JAWSDB_URL) { prefix = 'https://polar-fortress-89854.herokuapp.com/'}
    else { prefix = "http://localhost:8080/"}
    var link = `${prefix}resetpassword/${payload.userID}/${token}`;
    mailOptions.to = req.body.email;
    mailOptions.subject = "Password reset";
    mailOptions.text = `Hello! You've requested to reset your password. To reset your password, please click this link: ${link}`;
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        };
    });
});

app.get("/resetpassword/:id/:token", async function (req, res) {
    console.log(req.params);
    var secret = await db.query(`SELECT password FROM user WHERE id = ${req.params.id}`);
    try {
        console.log(secret[0].password)
        var payload = jwt.decode(req.params.token, secret[0].password);
        res.sendFile(path.join(__dirname, "/public/resetpassword.html"));
        console.log(payload)
    }
    catch {
        console.log("error with signature")
        res.sendFile(path.join(__dirname, "/public/deadlink.html"));
    };
});

app.post("/setnewpassword", async function (req, res) {
    let newHashedPassword = sha256(req.body.password)
    await db.query(`UPDATE user SET password = '${newHashedPassword}' WHERE id = ${req.body.userID}`)
    res.send("done")
});

app.get("/main", async function(req,res) {
    res.sendFile(path.join(__dirname, "/public/main.html"));
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
    var response = {};
    let existUser = await db.query(`SELECT * FROM user WHERE username = '${req.body.username}'`);
    let existEmail = await db.query(`SELECT email FROM user WHERE email = '${req.body.email}'`);
    if (existUser[0] !== undefined){
        response.user = "User exists"
    };
    if (existEmail[0] !== undefined) {
        response.email = "Email exists"
    };
    console.log(Object.keys(response).length);
    if (Object.keys(response).length == 0 && req.body.errorCount == 0) {
        console.log("here")
        await db.query(`INSERT INTO user (firstName, lastName, email, username, password, points, deduction_notification) VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.username}', '${sha256(req.body.password)}', 0, 0)`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}'`);
        userid = useridObj[0].id;
        response.success = "Success"
        response.userID = userid
    };
    console.log(response);
    res.send(response);
});

app.post("/group", async function (req, res) {
    response = {}
    group = await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID} ORDER BY points DESC`);
    response.group = group
    username = await db.query(`SELECT username FROM user WHERE id = ${req.body.userID}`);
    response.username = username
    res.json(response);
});

app.post("/searchGroup", async function(req,res) {
    let groupSearch = await db.query(`SELECT * FROM company WHERE name LIKE '%${req.body.groupName}%' `);
    res.json(groupSearch);
});

app.post("/joinGroup", async function(req,res) {
    response = {}
    var points = await startingPoints();
    await db.query(`UPDATE user SET user.companyId = ${req.body.companyID}, points = ${points} WHERE id = ${req.body.userID}`);
    await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID}`);
    response.points = points
    res.json(response);
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
        var response = {};
        response.points = points;
        response.companyName = req.body.groupName;
        response.companyID = companyID;
        res.json(response);
    };
});

app.post("/bets", async function(req, res) {
    let userBets = await db.query(`SELECT fixture_id, fixture, team, amountPlaced, amountwon, odds, amountwon, fixture_date, score FROM bet WHERE user_Id = ${req.body.userID}`);
    res.send(userBets);
});

app.post("/betHistory", async function(req, res) {
    console.log(req.body)
    var history = {};
    let userBets = await db.query(`SELECT fixture_id, fixture, team, amountPlaced, amountwon, odds, amountwon, fixture_date, score FROM bet WHERE user_Id = ${req.body.userID} ORDER BY fixture_date DESC`);
    history.userBets = userBets;
    if (req.body.companyID !== "") {
        let companyName = await db.query(`SELECT name FROM company WHERE id = ${req.body.companyID}`);
        history.companyName = companyName[0].name;
    };
    let userName = await db.query(`SELECT username FROM user WHERE id = ${req.body.userID}`);
    history.userName = userName[0].username;
    res.send(history);
});

app.post("/colleagueHistory", async function(req, res) {
    console.log(req.body)
    var response = {};
    var IDs = await db.query(`SELECT id, companyId FROM user WHERE username = '${req.body.username}'`);
    console.log(IDs)
    var companyName = await db.query(`SELECT name FROM company WHERE id = ${IDs[0].companyId}`);
    response.companyName = companyName[0].name;
    response.username = req.body.username;
    let userBets = await db.query(`SELECT fixture_id, fixture, team, amountPlaced, amountwon, odds, amountwon, fixture_date, score FROM bet WHERE user_Id = ${IDs[0].id} ORDER BY fixture_date DESC`);
    response.bets = userBets;
    res.send(response);
});


app.post("/betHistoryUser", async function (req, res){
    let userBets = await dbquery(`
        SELECT user.username, company.name, bet.fixture_id, bet.fixture, bet.team, bet.amountPlaced, bet.amountwon, bet.odds, bet.amountwon, bet.fixture_date, bet.score
        FROM user 
        LEFT JOIN company on company.id = user.companyid 
        LEFT JOIN bet on bet.user_Id = user.id
        WHERE user.id = ${req.body.userID}
        ORDER BY fixture_date DESC`)
    res.json(userBets);
});

app.post("/placeBet", async function(req,res) {
    let userpoint = await db.query(`SELECT points FROM user WHERE id = '${req.body.userID}'`);
    if(userpoint[0].points >= req.body.amount) {
        await db.query(`INSERT INTO bet (fixture, fixture_id, team, amountPlaced, odds, user_Id, fixture_date, game_week) VALUES ('${req.body.fixture}', ${req.body.fixtureID}, '${req.body.team}', ${req.body.amount}, ${req.body.odds}, ${req.body.userID}, '${req.body.date}', '${req.body.gameWeek}')` );
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
        };
    };
    query = `UPDATE user SET`;
    for ([key, value] of Object.entries(req.body)) {
        query += ` ${key} = '${value}',`;
    };
    query = query.slice(0, -1);
    query += ` WHERE id = ${userID}`;
    await db.query(query);
    res.send("updated");
});

app.post("/deleteAccount", async function(req,res) {
    inputPassword = sha256(req.body.password);
    dbPassword = await db.query(`SELECT password FROM user WHERE id = ${req.body.userID}`);
    if (inputPassword == dbPassword[0].password) {
        res.send("correct password")
        await db.query(`DELETE FROM user WHERE id = '${req.body.userID}'`);
        // await db.query(`DELETE FROM bet WHERE user_id = '${req.body.userID}'`);
        bet_id =  await db.query(`SELECT id FROM bet WHERE user_id = ${req.body.userID}`);
        for (a = 0; a < bet_id.length; a++){
            await db.query(`DELETE FROM bet WHERE id = ${bet_id[a].id}`);
        };
    }
    else { res.send("incorrect password") };
});

app.post("/leaveCompany", async function (req, res) {
    inputPassword = sha256(req.body.password);
    dbPassword = await db.query(`SELECT password FROM user WHERE id = ${req.body.userID}`);
    if (inputPassword == dbPassword[0].password) {
        res.send("correct password")
        await db.query(`UPDATE user SET companyId = NULL, points = 0 WHERE id = ${req.body.userID}`);
        bet_id =  await db.query(`SELECT id FROM bet WHERE user_id = ${req.body.userID}`);
        for (a = 0; a < bet_id.length; a++){
            await db.query(`DELETE FROM bet WHERE id = ${bet_id[a].id}`);
        };
    }
    else { res.send("incorrect password") };
});

async function startingPoints() {
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    let allFixtures = await axios(settings);
    var futureFixturesCount = 0;
    date_timestamp = Date.now().toString();
    date_timestamp = date_timestamp.slice(0,-3);
    for (fixture of Object.entries(allFixtures.data.api.fixtures)) {
        if (fixture[1].event_timestamp > date_timestamp) {
            futureFixturesCount++;
        };
    };
    ptsPerGame = 5;
    var points = futureFixturesCount * ptsPerGame
    return points;
};

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
                if (game.fixtureID == fixture.fixture_id && fixture.status == "Match Finsihed") {
                    if (fixture.goalsHomeTeam > fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: fixture.homeTeam.team_name, score: `${goalsHomeTeam} - ${goalsAwayTeam}`})}
                    else if (fixture.goalsHomeTeam < fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: fixture.awayTeam.team_name, score: `${goalsHomeTeam} - ${goalsAwayTeam}`})}
                    else if (fixture.goalsHomeTeam = fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: "Draw", score: `${goalsHomeTeam} - ${goalsAwayTeam}`})};
                };
            };
        };
        if (completedGames !== []) {
            for (game of completedGames) {
                bet_id =  await db.query(`SELECT id FROM bet WHERE fixture_id = ${game.fixtureID};`);
                for (a = 0; a < bet_id.length; a++){
                    await db.query(`UPDATE bet SET winningTeam = '${game.result}', score = '${game.score}' WHERE id = ${bet_id[a].id};`);
                    await db.query(`UPDATE bet SET amountwon = amountPlaced * odds WHERE id = ${bet_id[a].id} AND winningTeam = team`);
                    await db.query(`UPDATE bet SET amountwon = 0 WHERE id = ${bet_id[a].id} AND winningTeam != team`);
                };
                tempo = await db.query(`SELECT user_id, SUM(amountwon) FROM bet WHERE fixture_id = ${game.fixtureID} GROUP BY user_id;`);
                for(b = 0; b < tempo.length; b++){
                    await db.query(`UPDATE user SET points = points + ${tempo[b]['SUM(amountwon)']} WHERE id = ${tempo[b].user_id}`);
                };
            };
        };
    };
};

async function dailyUpdate() {
    var nowStamp = Date.now().toString();
    nowStamp = nowStamp.slice(0,-3);
    var storedGameWeek = await db.query(`SELECT game_week FROM info WHERE id = 1`);
    storedGameWeek = storedGameWeek[0].game_week;
    var lastUpdateStamp = await db.query(`SELECT last_update_stamp FROM info WHERE id = 1`);
    //Test if it's been 24 hours since last check to see if game week changed
    console.log(nowStamp)
    console.log(nowStamp - 86400)
    console.log(lastUpdateStamp)
    if (nowStamp - 86400 > lastUpdateStamp[0].last_update_stamp) {
        console.log("time to update")
        // Has been 24 hours, set new last_update_stamp
        db.query(`UPDATE info SET last_update_stamp = ${nowStamp} WHERE id = 1`)
        //pull new game week data from API
        settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
        let data = await axios(settings);
        fixtures = data.data.api.fixtures;
        //loop to find current game week
        for (fixture of fixtures) {
            if (fixture.event_timestamp > nowStamp) {
                currentGameWeek = fixture.round.replace(/[^0-9]/g,'');
                break;
            };
        };
        // Check if current game week is newer than stored game week
        if (currentGameWeek > storedGameWeek) {
            //execute points function for previous game week
            pointPenalty(storedGameWeek);
            //update game week in database
            db.query(`UPDATE info SET game_week = ${currentGameWeek}`);
        }
    }
    else {
        console.log("already checked for new game week in the last 24 hours");
    };
};

async function pointPenalty(pastGameWeek) {
    console.log("penalty function")
    let userBaseInCompanies = await db.query(`SELECT id FROM user WHERE companyId IS NOT NULL`);
    let bettingUsers = await db.query(`SELECT user_Id FROM bet WHERE game_week = '${pastGameWeek}'`);
    bettingUserArray = [];
    for (user of bettingUsers) {
        bettingUserArray.push(user.user_Id);
    };
    var nonBettingUsers = [];
    uniqueBettingUserArray = [...new Set(bettingUserArray)];
    for (user of userBaseInCompanies) {
        var match = false;
        for (bettingUser of uniqueBettingUserArray) {
            if (bettingUser == user.id) {
                match = true;
            };
        };
        if (match == false){
            nonBettingUsers.push(user.id);
        };
    };
    var deduction = 25;
    console.log(userBaseInCompanies)
    console.log(bettingUsers)
    console.log(nonBettingUsers)
    let result = await db.query(`UPDATE user SET points = points - ${deduction} WHERE id in (${nonBettingUsers})`);
    console.log(result)
    let result2 = await db.query(`UPDATE user SET deduction_notification = deduction_notification + ${deduction} WHERE id in (${nonBettingUsers})`);
    console.log(result2)
};

//Initial and 5-min interval database update for final game scores
dailyUpdate();
setInterval(dailyUpdate, 86400000);
checkGames();
setInterval(checkGames, 300000)
