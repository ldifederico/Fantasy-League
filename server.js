const inquirer = require("inquirer");
const express = require('express');


const PORT = process.env.PORT || 8080;
const mysql = require('mysql');

const app = express();
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));



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
  
async function main(){

}

main();