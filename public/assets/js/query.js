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
  
const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "testtest",
    database: "FantasyDB"
  });
  
async function main(){

    companyList = [];
    userList = [];
    incompleteGames = [];
    uniqueGames = [];
    let bet_id;
    let userid;
    let companyid;
    let tempo;

    let companies = await db.query("SELECT * FROM company");
        for (i = 0; i<companies.length; i++){
            companyList.push(companies[i].name);
        }
//checking and setting results

//sending unique games to back-end to check for result
        let games = await db.query("SELECT fixture_id FROM bet WHERE winningTeam IS NULL ");
        for (i = 0; i<games.length; i++){
            //incompleteGames[i].fixtureID = games[i].fixture_id;
            incompleteGames.push(games[i].fixture_id) ;
             //incompleteGames.push({fixtureID: games[i].fixture_id, result: ""});     
        }
        set = new Set(incompleteGames);
        unique = [...set];
        for (i = 0; i<unique.length; i++){
            uniqueGames.push({fixtureID: unique[i], result: ""});    
        }
        unique
        console.log(uniqueGames);



        //get back result games from backend if games are done
        if (uniqueGames[0] !== undefined){
        uniqueGames[0].result = 'Liverpool';
        uniqueGames[1].result = 'Spurs';
        uniqueGames[2].result = 'Aston Villa';
        console.log(uniqueGames);
        for (i = 0; i<uniqueGames.length; i++){
          bet_id =  await db.query(`SELECT id FROM bet WHERE fixture_id = ${uniqueGames[i].fixtureID};`);
          //bet_id.push(bread);
          console.log(bet_id);
          for (a = 0; a<bet_id.length; a++){
            console.log(bet_id[a])
            await db.query(`UPDATE bet SET winningTeam = '${uniqueGames[i].result}' WHERE id = ${bet_id[a].id};`);
            await db.query(`UPDATE bet SET amountwon = amountPlaced * odds WHERE id = ${bet_id[a].id} AND winningTeam = team`);
            await db.query(`UPDATE bet SET amountwon = 0 WHERE id = ${bet_id[a].id} AND winningTeam != team`);
            
            }
            

        
        }
        tempo = await db.query(`SELECT user_id, SUM(amountwon) FROM bet GROUP BY user_id;`);
            console.table(tempo);
            for(b=0; b<tempo.length; b++){
            await db.query(`UPDATE user SET points = points + ${tempo[b]['SUM(amountwon)']} WHERE id = ${tempo[b].user_id}`)
            }
        betting = await db.query(`SELECT * FROM bet`);
        console.table(betting);
        pooh = await db.query(`SELECT * FROM user ORDER BY points DESC`);
        console.table(pooh);
    };

    
        


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let task = await inquirer
            .prompt([
                {
                    type: "list",
                    message: "Please Select",
                    name: "enter",
                    choices: [
                        "Log In",
                        "Sign Up"
                    ]
                },
            ])
//Sign Up NEW USER
            if (task.enter == "Sign Up"){

                await inquirer
                .prompt([
                    {
                        type: "input",
                        message: "Please enter First Name",
                        name: "firstName",
                    },
                    {
                        type: "input",
                        message: "Please enter Last Name",
                        name: "lastName",
                    },
                    {
                        type: "input",
                        message: "Please enter valid email address",
                        name: "email",
                    },
                    {
                        type: "input",
                        message: "Please enter valid username",
                        name: "username",
                    },
                    {
                        type: "input",
                        message: "Please enter valid password",
                        name: "password",
                    },

                ]).then(
//check if username or email already exists in db and add user to database
                    async (response)=>{
                        let existUser = await db.query(`SELECT * FROM user WHERE username = '${response.username}' OR email = '${response.email}'`);
                        //console.log(existUser[0]);
                        if (existUser[0] !== undefined){
                            //console.log("user exists");
                            console.log("User with this username or email address already exists");
                            await main();
                        }
                        else{
                            //console.log("can add user");
                            await db.query(`INSERT INTO user (firstName, lastName, email, username, password, points) VALUES ('${response.firstName}', '${response.lastName}', '${response.email}', '${response.username}', '${response.password}', 100)`);
                            let useridObj = await db.query(`SELECT id FROM user WHERE username = '${response.username}'`);
                            userid = useridObj[0].id;
                            console.log("Congrats user created, please join or create a company league");

                            await inquirer
                            .prompt([
                                {
                                        type: "list",
                                        message: "Please Select",
                                        name: "joinorcreate",
                                        choices: [
                                            "Join Company league",
                                            "Create new league"
                                        ]
                                },
                            ]).then(async (response)=>{
//jOIN AN existing league
                                //console.log(response.joinorcreate);
                                if (response.joinorcreate == "Join Company league"){

                                                    await inquirer
                                                    .prompt([
                                                                {
                                                                type: "list",
                                                                message: "Please Select",
                                                                name: "joincompany",
                                                                choices: companyList
                                                                },
                                                            ]).then(
                                                                async (response) => {
                                                                    let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${response.joincompany}'`);
                                                                    companyid = companyidObj[0].id;
                                                                    console.log(companyid);
                                                                    //await db.query(`SELECT * FROM user WHERE username = '${response.username}' AND email = '${response.email}'`);
                                                                    await db.query(`UPDATE user SET companyId = ${companyid} WHERE id = ${userid}`);
                                                                    let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
                                                                    console.table(table);
                                                                }
                                                            )

                                }

                                if (response.joinorcreate == "Create new league"){
//creating new league
                                    await inquirer
                                    .prompt([
                                        {
                                            type: "input",
                                            message: "Please enter Company Name",
                                            name: "companyName",
                                        },
                                    ]).then(
                                        async (response) => {
                                            let existCompany = await db.query(`SELECT * FROM company WHERE name = '${response.companyName}'`);
                        //console.log(existUser[0]);
                        if (existCompany[0] !== undefined){
                            //console.log("user exists");
                            console.log("This Company league already exists");
                            await main();
                        }else{
                                            await db.query(`INSERT INTO company (name) VALUES ('${response.companyName}')`);
                                            let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${response.companyName}'`);
                                            companyid = companyidObj[0].id;
                                            console.log(companyid);
                                            //await db.query(`SELECT * FROM user WHERE username = '${response.username}' AND email = '${response.email}'`);
                                            await db.query(`UPDATE user SET companyId = ${companyid} WHERE id = ${userid}`);
                                            let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
                                            console.table(table);
                        }
                                        }
                                    )
                                }
                            }
                            )
                        }
                    })




                    // async (response)=>{
                    //     try {
                    //         let table = await db.query(`SELECT * FROM user WHERE username = '${response.username}' OR email = '${response.email}'`);
                    //         //let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid[0].companyId} `);
                    //         console.table(table);
                    //         console.log("User with this username or email address already exists");
                    //         await main();
                            
                    //     } catch (error) {
                    //         console.log("user can be added");
                    //         await db.query(`INSERT INTO user (firstName, lastName, email, username, password) VALUES ('${response.firstName}', '${response.lastName}', '${response.email}', '${response.username}', '${response.password}')`);
                    //         userid = await db.query(`SELECT id FROM user WHERE username = '${response.username}'`);
                    //         console.log("Congrats user created, please join or create a company league")
                            
                    //         let joinOrCreate = await inquirer
                    //         .prompt([
                    //                     {
                    //                     type: "list",
                    //                     message: "Please Select",
                    //                     name: "joincompany",
                    //                     choices: companyList
                    //                     },
                    //                 ]).then(
                    //                     async (response) => {
                    //                         companyid = await db.query(`SELECT id FROM company WHERE name = '${response.joincompany}'`);
                    //                         await db.query(`SELECT * FROM user WHERE username = '${response.username}' AND email = '${response.email}'`);
                    //                         await db.query(`INSERT INTO user (companyId) VALUES (${companyid}) WHERE id = ${userid}`);
                    //                         let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid[0].companyId} `);
                    //                         console.table(table);
                    //                     }
                    //                 )
                            
                    //     }
                            
                    // }
                    //)
            }
//Log In
        if (task.enter == "Log In"){
        try{
        await inquirer
            .prompt([
                {
                    type: "input",
                    message: "Please enter username",
                    name: "username",
                },
                {
                    type: "input",
                    message: "Please enter password",
                    name: "password", 
                }
            ]).then(
                    async (response)=>{
                    let companyidObj = await db.query(`SELECT companyId FROM user WHERE username = '${response.username}' AND password = '${response.password}'`);
                    let useridObj = await db.query(`SELECT id FROM user WHERE username = '${response.username}' AND password = '${response.password}'`);
                    companyid = companyidObj[0].companyId;
                    userid = useridObj[0].id;

                    console.log(companyid);
                    console.log(userid);


//view company table

                        // let existUser = await db.query(`SELECT * FROM user WHERE username = '${response.username}' OR email = '${response.email}'`);
                        // //console.log(existUser[0]);
                        // if (existUser[0] !== undefined){
                        // }
                    let check = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
                    
                    if (check[0] == undefined){
                        console.log("You are not currently a part of any leagues please join or create one")
                    }
                    else{
                        console.table(check);
                    }
                    
            })
        } catch(error){
            console.log("Incorrect Log in information")
            await main();
        }
    }

//view or place bet
            let response = await inquirer
                .prompt([
                    {
                        type: "list",
                        message: "What would you like to do?",
                        name: "bets",
                        choices:[
                            "View your betting history",
                            "Place new bet",
                            "Delete company",
                            "Join/Create new company league",
                            "Delete User"
                            
                            ]
                    },
                ])

                if (response.bets == "View your betting history"){
                    let userbets = await db.query(`SELECT * FROM bet WHERE user_Id = '${userid}'`);
                    console.table(userbets);
                }

                if (response.bets == "Place new bet"){
                    await inquirer
                            .prompt([
                                        {
                                            type: "input",
                                            message: "Please enter Fixture ID",
                                            name: "fixtureId",
                                        },
                                        {
                                            type: "input",
                                            message: "Please enter Fixture",
                                            name: "fixture", 
                                        },
                                        {
                                            type: "input",
                                            message: "Please enter Team",
                                            name: "team", 
                                        },
                                        {
                                            type: "input",
                                            message: "Please enter amout to place",
                                            name: "amount", 
                                        },
                                        {
                                            type: "input",
                                            message: "What are the odds",
                                            name: "odds", 
                                        },
                            ]).then(
                                async (response)=>{
                                    let userpoint = await db.query(`SELECT points FROM user WHERE user_Id = '${userid}'`);
                                    if (userpoint[0].points<response.amount){
                                    console.log(`'${response.fixture}', ${response.fixtureID}, '${response.team}', ${response.amount}, ${response.odds}, ${userid}`);
                                    await db.query(`INSERT INTO bet (fixture, fixture_id, team, amountPlaced, odds, user_Id ) VALUES( '${response.fixture}', ${response.fixtureId}, '${response.team}', ${response.amount}, ${response.odds}, ${userid})` );
                                    await db.query(`UPDATE user SET points = points - ${response.amount} WHERE id = ${userid}; `);

                                    let beets = await db.query("SELECT * FROM bet");
                                    let tuna = await db.query("SELECT * FROM user");
                                    console.table(beets);
                                    console.table(tuna);
                                    }
                                    else{
                                        console.log("No Money No Honey");
                                    }
                                })
                }

                if (response.bets == "Delete company"){
                    
                    await db.query(`DELETE FROM company WHERE id = ${companyid} `);

                    let users = await db.query(`SELECT id from user WHERE companyId = ${companyid} `);
                    for (i = 0; i<users.length; i++){
                        await db.query(`UPDATE user SET companyId = null WHERE id = ${users[i].id}`)
                        //userList.push(`${users[i].id}`);
                    }
                    
                    let table = await db.query(`SELECT * FROM user `);
                    console.table(table);
                    let table2 = await db.query(`SELECT * FROM company`);
                    console.table(table);
                    console.table(table2);
                    //main();
                    } 

                    if(response.bets == "Join/Create new company league"){

                        await inquirer
                            .prompt([
                                {
                                        type: "list",
                                        message: "Please Select",
                                        name: "joinorcreate",
                                        choices: [
                                            "Join Company league",
                                            "Create new league"
                                        ]
                                },
                            ]).then(async (response)=>{
//jOIN AN existing league
                                //console.log(response.joinorcreate);
                                if (response.joinorcreate == "Join Company league"){

                                                    await inquirer
                                                    .prompt([
                                                                {
                                                                type: "list",
                                                                message: "Please Select",
                                                                name: "joincompany",
                                                                choices: companyList
                                                                },
                                                            ]).then(
                                                                async (response) => {
                                                                    let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${response.joincompany}'`);
                                                                    companyid = companyidObj[0].id;
                                                                    console.log(companyid);
                                                                    //await db.query(`SELECT * FROM user WHERE username = '${response.username}' AND email = '${response.email}'`);
                                                                    await db.query(`UPDATE user SET companyId = ${companyid} WHERE id = ${userid}`);
                                                                    let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
                                                                    console.table(table);
                                                                }
                                                            )

                                }

                                if (response.joinorcreate == "Create new league"){
//creating new league
                                    await inquirer
                                    .prompt([
                                        {
                                            type: "input",
                                            message: "Please enter Company Name",
                                            name: "companyName",
                                        },
                                    ]).then(
                                        async (response) => {
                                            let existCompany = await db.query(`SELECT * FROM company WHERE name = '${response.companyName}'`);
                        //console.log(existUser[0]);
                        if (existCompany[0] !== undefined){
                            //console.log("user exists");
                            console.log("This Company league already exists");
                            await main();
                        }else{
                                            await db.query(`INSERT INTO company (name) VALUES ('${response.companyName}')`);
                                            let companyidObj = await db.query(`SELECT id FROM company WHERE name = '${response.companyName}'`);
                                            companyid = companyidObj[0].id;
                                            console.log(companyid);
                                            //await db.query(`SELECT * FROM user WHERE username = '${response.username}' AND email = '${response.email}'`);
                                            await db.query(`UPDATE user SET companyId = ${companyid} WHERE id = ${userid}`);
                                            let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid} `);
                                            console.table(table);
                                        }
                                    }
                                    )
                                }
                            }
                            )




                    }

                    if(response.bets == "Delete User"){
                        await inquirer
                                    .prompt([
                                        {
                                            type: "list",
                                            message: "Are you absolutely sure you want to do this? Theres no going back",
                                            name: "delete",
                                            choices: [
                                                "Yes",
                                                "No"
                                            ]
                                        },
                                    ]).then(async (response) => {
                                        if (response.delete == "Yes"){
                                            await db.query(`DELETE FROM user WHERE id = ${userid} `);
                                            main();
                                        } 
                                    })
                    }
            



        // let response = await inquirer
        //     .prompt([
        //         {
        //             type: "list",
        //             message: "what company league do you belong to?",
        //             name: "company",
        //             choices:companyList
        //         },
        //         ]).then(async (response)=>{
        //             let companyid = await db.query(`SELECT id FROM company WHERE name = '${response.company}'`);
        //             let table = await db.query(`SELECT * FROM user WHERE companyId = ${companyid[0].id} `);
        //             console.table(table);
        //             main();
        //         });



 //}
                }

 main();