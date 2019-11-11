const express = require('express');
const path = require('path');

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
}
  
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

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});

//End Points=
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/main.html"));
});

app.get("/team", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/team.html"));
    
});


module.exports = function(app) {

};