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

var quota
var settings = {
	"async": true,
	"crossDomain": true,
	"url": "",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
    },
    "success": function(data, status, xhr) {
        quota = xhr.getResponseHeader('x-ratelimit-requests-remaining');
    }
};

async function APIRequest(url) {
    settings.url = url;
    APIResult = await axios(settings);
    console.log(`API Request executed for ${url}. Remaining quota: ${APIResult.headers['x-ratelimit-requests-remaining']}`);
    //Update quota information in database
    db.query(`UPDATE quota SET requests_remaining = ${APIResult.headers['x-ratelimit-requests-remaining']}, timestamp = ${getCurrentTimestamp()} WHERE id = 1`);
    return APIResult;
}

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
    try {
        await db.query(`SELECT id FROM user WHERE id = ${req.body.userID}`);
        res.send("verified");
    }
    catch {
        res.send("not verfied");
    }
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/login.html"));
});

app.post("/", async function(req, res) {
    try {
        var response = {};
        var userInfo = await db.query(`SELECT id, companyId, deduction_notification FROM user WHERE username = '${req.body.username}' AND password = '${sha256(req.body.password)}'`);
        response.userID = userInfo[0].id;
        if (userInfo[0].companyId !== null) { response.companyID = userInfo[0].companyId };
        if (userInfo[0].deduction_notification !== null && userInfo[0].deduction_notification !== 0) { response.deductions = userInfo[0].deduction_notification };
        res.send(response);
    } catch(error) {
        res.send({text: "incorrect login"});
    };
});

app.post("/pointpenalty", async function (req, res) {
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
    var secret = await db.query(`SELECT password FROM user WHERE id = ${req.params.id}`);
    try {
        var payload = jwt.decode(req.params.token, secret[0].password);
        res.sendFile(path.join(__dirname, "/public/resetpassword.html"));
    }
    catch {
        res.sendFile(path.join(__dirname, "/public/deadlink.html"));
    };
});

app.post("/setnewpassword", async function (req, res) {
    let newHashedPassword = sha256(req.body.password);
    await db.query(`UPDATE user SET password = '${newHashedPassword}' WHERE id = ${req.body.userID}`);
    res.send("done");
});

app.get("/main", async function(req,res) {
    res.sendFile(path.join(__dirname, "/public/main.html"));
});

app.post("/profile", async function(req,res) {
    userInfo = await db.query(`SELECT * FROM user WHERE id = ${req.body.userID}`);
    companyInfo = await db.query(`SELECT * FROM company WHERE id = ${userInfo[0].companyId}`);
    if (companyInfo[0] !== undefined) {
        userInfo[0].companyName = companyInfo[0].name;
    }
    res.json(userInfo);
});

app.post("/register", async function(req,res) {
    var response = {};
    let existUser = await db.query(`SELECT * FROM user WHERE username = '${req.body.username}'`);
    let existEmail = await db.query(`SELECT email FROM user WHERE email = '${req.body.email}'`);
    if (existUser[0] !== undefined){
        response.user = "User exists";
    };
    if (existEmail[0] !== undefined) {
        response.email = "Email exists";
    };
    if (Object.keys(response).length == 0 && req.body.errorCount == 0) {
        await db.query(`INSERT INTO user (firstName, lastName, email, username, password, points, deduction_notification) VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.username}', '${sha256(req.body.password)}', 0, 0)`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}'`);
        userid = useridObj[0].id;
        response.success = "Success";
        response.userID = userid;
    };
    res.send(response);
});

app.post("/group", async function (req, res) {
    response = {};
    group = await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID} ORDER BY points DESC`);
    response.group = group;
    username = await db.query(`SELECT username FROM user WHERE id = ${req.body.userID}`);
    response.username = username;
    res.json(response);
});

app.post("/searchGroup", async function(req,res) {
    let groupSearch = await db.query(`SELECT * FROM company WHERE name LIKE '%${req.body.groupName}%' `);
    res.json(groupSearch);
});

app.post("/joinGroup", async function(req,res) {
    response = {};
    var points = await startingPoints();
    await db.query(`UPDATE user SET user.companyId = ${req.body.companyID}, points = ${points} WHERE id = ${req.body.userID}`);
    await db.query(`SELECT * FROM user WHERE companyid = ${req.body.companyID}`);
    response.points = points;
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

app.post("/loadOdds", async function (req, res) {
    let oddsData = []
    for (fixture of req.body.fixtures) {
        oddsData.push(await db.query(`SELECT * FROM odds WHERE fixture_id = ${fixture.fixture_id}`))
    }
    res.send(oddsData);
})

app.post("/bets", async function(req, res) {
    let userBets = await db.query(`SELECT fixture_id, fixture, team, amountPlaced, amountwon, odds, amountwon, fixture_date, score FROM bet WHERE user_Id = ${req.body.userID}`);
    res.send(userBets);
});

app.post("/betHistory", async function(req, res) {
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
    var response = {};
    var IDs = await db.query(`SELECT id, companyId FROM user WHERE username = '${req.body.username}'`);
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
        ORDER BY fixture_date DESC`);
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
        res.send("correct password");
        await db.query(`UPDATE user SET companyId = NULL, points = 0 WHERE id = ${req.body.userID}`);
        bet_id =  await db.query(`SELECT id FROM bet WHERE user_id = ${req.body.userID}`);
        for (a = 0; a < bet_id.length; a++){
            await db.query(`DELETE FROM bet WHERE id = ${bet_id[a].id}`);
        };
    }
    else { res.send("incorrect password") };
})

app.post("/quotaCheck", async function (req, res) {
    res.send((await quotaCheck()).toString());
})

app.post("/updateQuota", async function (req, res) {
    await db.query(`UPDATE quota SET requests_remaining = ${req.body.quota}, timestamp = ${getCurrentTimestamp()} WHERE id = 1`)
    res.send("Quota Updated")
})

app.get("/getStoredStandings", async function (req, res) {
    let standingsData = await db.query(`SELECT * FROM standings`);
    res.send(standingsData);
})

async function startingPoints() {
    console.log("Calculating starting points for new user")
    let allFixtures = await APIRequest("https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524")
    var futureFixturesCount = 0;
    date_timestamp = Date.now().toString();
    date_timestamp = date_timestamp.slice(0,-3);
    for (fixture of Object.entries(allFixtures.data.api.fixtures)) {
        if (fixture[1].event_timestamp > date_timestamp) {
            futureFixturesCount++;
        };
    };
    ptsPerGame = 5;
    var points = futureFixturesCount * ptsPerGame;
    return points;
};

//Stores all functions/checks that need to be run daily
async function dailyUpdate() {
    //QUOTA CHECK AND THEN CONSOLE LOG THE LAST UPDATE IF QUOTA IS EMPTY
    var lastUpdateStamp = await db.query(`SELECT last_update_stamp FROM info WHERE id = 1`);
    let currentQuota = await quotaCheck();
    if (currentQuota > 0) {
        console.log(`Checking if database requires daily update...`);
        var currentTimestamp = getCurrentTimestamp();
        //Check if it's been 24 hours since last daily update
        if (currentTimestamp - lastUpdateStamp[0].last_update_stamp > 86400) {
            console.log(`Last update performed at ${timestampToDate(lastUpdateStamp[0].last_update_stamp)}, executing Daily Update...`);
            //API quota has room, set last update stamp in DB and execute Daily Update functions

            let APIdata = await APIRequest("https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524");

            await pointPenalty(APIdata, currentTimestamp);
            await checkGames(APIdata, currentTimestamp, "Daily");
            await oddsUpdate();
            await standingsUpdtate();
            //Update Database with new update timestamp
            db.query(`UPDATE info SET last_update_stamp = ${currentTimestamp} WHERE id = 1`);
            console.log(`Daily Update completed as of ${timestampToDate(getCurrentTimestamp())}.`)
        }
        else {
            console.log(`Last Daily Update performed at ${timestampToDate(lastUpdateStamp[0].last_update_stamp)}, Daily Update is not required.`);
        };
    }
    else if (currentQuota == 0) {
        console.log(`Unable to run Daily Update function due to insufficient API Quota. Last update performed on ${timestampToDate(lastUpdateStamp)}`);
    };
};

async function pointPenalty(APIdata, currentTimestamp) {
    var fixtures = APIdata.data.api.fixtures
    var storedGameWeek = (await db.query(`SELECT game_week FROM info WHERE id = 1`))[0].game_week;
    //loop to find current game week
    for (fixture of fixtures) {
        if (fixture.event_timestamp > currentTimestamp) {
            currentGameWeek = fixture.round.replace(/[^0-9]/g,'');
            break;
        };
    };
    // Check if current game week is newer than stored game week
    if (currentGameWeek > storedGameWeek) {
        //Calculate points penalty from the previous week
        console.log("Daily Update - Gameweek/point penalty: New game week! Executing point pentalty function");
        let userBaseInCompanies = await db.query(`SELECT id FROM user WHERE companyId IS NOT NULL`);
        for (x = storedGameWeek; x < currentGameWeek; x++) {
            let bettingUsers = await db.query(`SELECT user_Id FROM bet WHERE game_week = '${storedGameWeek}'`);
            let bettingUserArray = [];
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
            if (nonBettingUsers.length > 0) {
                var deduction = 25;
                await db.query(`UPDATE user SET points = points - ${deduction} WHERE id in (${nonBettingUsers})`);
                await db.query(`UPDATE user SET deduction_notification = deduction_notification + ${deduction} WHERE id in (${nonBettingUsers})`);
                console.log(`Daily Update - Gameweek/point penalty: ${nonBettingUsers.length} users had ${deduction} points deducted due to inactivity in game week ${x}.`);
            }
            else {
                console.log(`Daily Update - Gameweek/point penalty: No users have been penalized for game week ${x}.`)
            };
        }
        //update game week in database
        db.query(`UPDATE info SET game_week = ${currentGameWeek}`);
    }
    else {
        console.log("Daily Update - Gameweek/point penalty: The game week has not changed, therefore no updates are required.")
    };
};

async function checkGames(APIdata, currentTimestamp, frequency) {
    var incompleteGames = [];
    var uniqueGames = [];
    var completedGames = [];
    let games = await db.query("SELECT DISTINCT fixture_id, event_timestamp FROM bet WHERE winningTeam IS NULL ORDER BY event_timestamp ASC");
    //Test if the oldest unfinished game has been completed (Start time + 2 hours), if so then make API call to update database
    if (games.length !== 0 && games[0].event_timestamp + 7200 < currentTimestamp) {
        console.log(`${frequency} Update - Check games: Database requires an update with game data from API.`);
        if (APIData == "Request data") {
            APIdata = await APIRequest("https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524");
        };
        if (games[0].fixture_id !== null) {
            for (i = 0; i < games.length; i++) {
                incompleteGames.push(games[i].fixture_id);
            };
            set = new Set(incompleteGames);
            unique = [...set];
            for (i = 0; i < unique.length; i++) {
                uniqueGames.push({fixtureID: unique[i], result: ""}); 
            };
            let seasonFixtures = APIdata.data.api.fixtures;
            for (game of uniqueGames) {
                for (fixture of seasonFixtures) {
                    if (game.fixtureID == fixture.fixture_id && fixture.status == "Match Finished") {
                        var score = `${fixture.goalsHomeTeam} - ${fixture.goalsAwayTeam}`;
                        if (fixture.goalsHomeTeam > fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: fixture.homeTeam.team_name, score: score})}
                        else if (fixture.goalsHomeTeam < fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: fixture.awayTeam.team_name, score: score})}
                        else if (fixture.goalsHomeTeam == fixture.goalsAwayTeam) {completedGames.push({fixtureID: game.fixtureID, result: "Draw", score: score})};
                    };  
                };
            };
            if (completedGames !== []) {
                for (game of completedGames) {
                    bet_id =  await db.query(`SELECT id FROM bet WHERE fixture_id = ${game.fixtureID};`);
                    for (a = 0; a < bet_id.length; a++) {
                        await db.query(`UPDATE bet SET winningTeam = '${game.result}', score = '${game.score}' WHERE id = ${bet_id[a].id};`);
                        await db.query(`UPDATE bet SET amountwon = amountPlaced * odds WHERE id = ${bet_id[a].id} AND winningTeam = team`);
                        await db.query(`UPDATE bet SET amountwon = 0 WHERE id = ${bet_id[a].id} AND winningTeam != team`);
                    };
                    let tempo = await db.query(`SELECT user_id, SUM(amountwon) FROM bet WHERE fixture_id = ${game.fixtureID} GROUP BY user_id;`);
                    for(b = 0; b < tempo.length; b++){
                        await db.query(`UPDATE user SET points = points + ${tempo[b]['SUM(amountwon)']} WHERE id = ${tempo[b].user_id}`);
                    };
                };
            };
        };
        console.log(`${frequency} Update - Check games: Updated ${completedGames.length} games in the database.`)
    }
    else {
        console.log(`${frequency} Update - Check games: Database is up to date with all game data from API.`)
    }
};

async function oddsUpdate() {
    //(API updates their data daily)
    let oddsAPIdata = (await APIRequest("https://api-football-v1.p.rapidapi.com/v2/odds/league/524")).data.api.odds;
    let oddsDBdata = await db.query(`SELECT fixture_id FROM odds`);
    var add = 0, update = 0, error = 0, match = false;
    for (fixtureAPI of oddsAPIdata) {
        //Try Catch for when the API does not provide complete/any odds
        try {
            for (fixtureDB of oddsDBdata) {
                if (fixtureDB.fixture_id == fixtureAPI.fixture.fixture_id) {
                    await db.query(`UPDATE odds SET home = ${fixtureAPI.bookmakers[0].bets[0].values[0].odd}, draw = ${fixtureAPI.bookmakers[0].bets[0].values[1].odd} , away = ${fixtureAPI.bookmakers[0].bets[0].values[2].odd} WHERE fixture_Id = ${fixtureDB.fixture_id}`);
                    match = true;
                    match++;
                    //BREAK??
                };
            };
            if (match == false) {
                await db.query(`INSERT INTO odds (fixture_id, home, draw, away) VALUES (${fixtureAPI.fixture.fixture_id}, ${fixtureAPI.bookmakers[0].bets[0].values[0].odd}, ${fixtureAPI.bookmakers[0].bets[0].values[1].odd}, ${fixtureAPI.bookmakers[0].bets[0].values[2].odd})`);;
                add++;
            };
        }
        catch {
            error++;
        };
    };
    console.log(`Daily Update - Odds Update: Added ${add} odds, Updated ${update} odds, Errors with ${error} odds.`)
};

async function standingsUpdtate() {
    let standings = (await APIRequest("https://api-football-v1.p.rapidapi.com/v2/leagueTable/524")).data.api.standings[0];
    if (standings.length > 0) {
        //New data is available, remove old data and insert new data in database
        await db.query(`TRUNCATE TABLE standings`);
        for (team of standings) {
            await db.query(`INSERT INTO standings (ranking, club, played, win, draw, loss, ga, gf, gd, points) 
            VALUES (${team.rank}, "${team.teamName}", ${team.all.matchsPlayed}, ${team.all.win}, ${team.all.draw}, ${team.all.lose}, ${team.all.goalsAgainst}, ${team.all.goalsFor}, ${team.goalsDiff}, ${team.points})`);
        };
        console.log(`Daily Update - Standings Update: Updated EPL standings in the database.`)
    }
    else {
        console.log(`Daily Update - Standings Update: Unable to update EPL standings in databse due to API error.`)
    };
}

//Handy functions
function getCurrentTimestamp() {
    var d = new Date();
    var datum = Date.parse(d);
    return datum/1000;
};

function timestampToDate(timestamp) {
    var a = new Date(timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

async function quotaCheck() {
    console.log("Executing Quota Check...")
    //Calculate timestamp of last quota reset (11 AM daily)
    var lastQuotaReset = new Date();
    lastQuotaReset.setHours(11,0,0,0);
    //check if same date or yesterday's date
    var d = new Date();
    var datum = Date.parse(d);
    currentTimestamp = datum/1000;
    currentHour = d.getHours();
    if (currentHour < 11) {
        //quota reset was yesterday
        lastQuotaReset.setDate(lastQuotaReset.getDate() - 1);
    }
    let nextQuotaReset = new Date();
    nextQuotaReset.setHours(11,0,0,0);
    nextQuotaReset = nextQuotaReset.setDate(lastQuotaReset.getDate() + 1);
    var d2 = Date.parse(lastQuotaReset);
    lastQuotaResetTimestamp = d2/1000;

    //Test if quota has reset since last API request
    lastRequestTimestamp = await db.query(`SELECT timestamp FROM quota`);

    if (lastRequestTimestamp[0].timestamp < lastQuotaResetTimestamp) {
        //Quota has reset since last request, sending client confirmation to send API request
        console.log(`Quota has reset since last request. Current API Quota is 100.`)
        return 100
    }
    else {
        //Quote has not reset, still within today's quota. Determine if there is remaining requests
        quota = await db.query(`SELECT requests_remaining FROM quota `);
        if (quota[0].requests_remaining > 0) {
            //Room for more requests, sending client confirmation to send API request
            console.log(`API Quota has room for more requests. Current API Quota is ${quota[0].requests_remaining}.`)
            return quota[0].requests_remaining
        }
        else {
            //Today's quota has been fully used, sending client rejection to send API request
            console.log(`Today's API Quota has been fully used. API Quota will reset at ${nextQuotaReset}`)
            return quota[0].requests_remaining
        };
    };
}

//Initial and 5-min interval database update for final game scores
dailyUpdate();
setInterval(dailyUpdate, 86400000);

//Instead of running an API call every 5 minutes, store when games will be completed and check every 5 minutes if any games have been completed, then run API calls
setInterval( async () => {
    //Run quota check before CheckGames function
    let currentQuota = await quotaCheck();
    if (currentQuota > 0) {
        let currentTimestamp = getCurrentTimestamp();
        checkGames("Request data", currentTimestamp, "5 Minute Interval");
    }
    else if (currentQuota == 0) {
        console.log(`Unable to run Game Check (5 min interval) function due to insufficient API Quota.`);
    };
}, 3000000);

