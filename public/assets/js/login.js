async function sendLogin(event){
    event.preventDefault();
    login={}
    login.username = $("#username").val()
    login.password = $("#psw").val()
    let result = await $.ajax({
        method: "POST",
        url: "/",
        data: login
    })
    console.log(result)
    if (result.text == "correct login") {
        window.location.href = "/main"
    }
    else {
        console.log("incorrect login")
    };
}

// $("#registerbtn").on("click",sendLogin)
$("#registerbtn").click(sendLogin)