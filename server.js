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
  
if (process.env.JAWSDB_URL) {
    const db = mysql.createConnection(process.env.JAWSDB_URL);
} else {const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "testtest",
    database: "FantasyDB"
  });
};

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

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});

//End Points
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/main.html"));
});

app.post("/team", function(req, res) {
    console.log(req.body.name)
    res.sendFile(path.join(__dirname, "public/team.html"));
    // API call for team

    // res.send(JSON.stringify(teamData));
    // add 4 get requests and res.JSON(results) to team.js
});

module.exports = function(app) {

};
