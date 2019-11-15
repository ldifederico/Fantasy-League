async function sendLogin(event){
    event.preventDefault();
    login={}
    login.username = $("#username").val()
    login.password = $("#psw").val()
    $.ajax({
        method: "POST",
        url: "/",
        data: login
    })
}

// $("#registerbtn").on("click",sendLogin)
$("#registerbtn").click(sendLogin)