const path = require('path');
const express = require('express');
const mysql = require('mysql');

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
  
// if (process.env.JAWSDB_URL) {
//     const db = mysql.createConnection(process.env.JAWSDB_URL);
// } else {
    const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "FantasyDB"
  });
// }


var settings = {
	"async": true,
	"crossDomain": true,
	"url": "",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
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
    console.log(req.body)
    try{
        let companyidObj = await db.query(`SELECT companyId FROM user WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}' AND password = '${req.body.password}'`);
        companyid = companyidObj[0].companyId;
        userid = useridObj[0].id;
        //redirect to main page
    } catch(error){
        console.log("Incorrect Log in information")
        await main();
    }
});


app.get("/register", async function(req,res) {
    res.sendFile(path.join(__dirname, "./public/register.html"));
});

app.post("/register", async function(req,res) {
    let existUser = await db.query(`SELECT * FROM user WHERE username = '${req.body.username}' OR email = '${req.body.email}'`);
    if (existUser[0] !== undefined){
        console.log("User with this username or email address already exists");
    }
    else {
        await db.query(`INSERT INTO user (firstName, lastName, email, username, password) VALUES ('${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.username}', '${req.body.password}')`);
        let useridObj = await db.query(`SELECT id FROM user WHERE username = '${req.body.username}'`);
        userid = useridObj[0].id;
        console.log("Congrats user created, please join or create a company league");
        //redirect to main.html
        //does userid change when multiple people log in
    }
});

app.post("/searchGroup", async function(req,res) {
    let groupSearch = await db.query(`SELECT * FROM company WHERE name LIKE '%${req.body.groupName}%' `);
    res.json(groupSearch)
});

app.post("/joinGroup", async function(req,res) {
    await db.query(`UPDATE user SET companyId = ${req.body.companyID} WHERE id = ${userid}`);
    let table = await db.query(`SELECT * FROM user WHERE companyId = ${req.body.companyID} `);
});

app.post("/createGroup", async function(req,res) {
    let existCompany = await db.query(`SELECT * FROM company WHERE name = '${req.body.groupName}' `);
    if (existCompany[0] !== undefined){
        console.log("This company already exists");
    } 
    else {
    await db.query(`INSERT INTO company (name) VALUES ('${req.body.groupName}')`);
    let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${req.body.groupName}'`);
    companyid = companyidObj[0].id;
    console.log(companyid);
    userid = 5;
    await db.query(`UPDATE user SET companyId = ${companyid} WHERE id = ${userid}`);
    let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
    console.table(table);
    }
})

app.post("/team", function(req, res) {
    console.log(req.body.name)
    res.sendFile(path.join(__dirname, "public/team.html"));
});

app.get("/main", async function(req,res) {
    companyid = 1
    let check = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);

    if (check[0] == undefined){
        console.log("You are not currently a part of any leagues please join or create one")
    }
    else{
        res.json(check);
    }
})

