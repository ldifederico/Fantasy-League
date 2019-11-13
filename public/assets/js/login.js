
const connection = require('../config/connection')


async function sendLogin(){
    username = $("#username").val()
    password = $("#password").val()c
    console.log(username + password)
    // let userInfo = await dbquery(`SELECT username, password FROM user WHERE name = ${username} AND password = ${password}`);
    // if (userInfo == "") {incorrectCredentials();}
    // else { }

}

async function createAccount(username,password){

  let userInfo = await dbquery(`SELECT name FROM user WHERE name = ${username}`);
  if (userInfo == "") {incorrectCredentials();}
  else { }
  
}

// $("#registerbtn").on("click",sendLogin)