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
    if (result.text == "incorrect login") {
        $("#incorrect").remove()
        $("<div>").attr("id","incorrect").text(`Incorrect username and/or password`).appendTo("#buttonContainer")
    }
    else {
        localStorage.setItem("userID", result.userID,)
        localStorage.setItem("companyID", result.companyID)
        window.location.href = "/main"
    };
}

$("#registerbtn").click(sendLogin)