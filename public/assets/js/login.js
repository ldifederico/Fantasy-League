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
    console.log(result.text)
    if (result.text == "correct login") {
        window.location.href = "/main"
    }
    else {
        $("#incorrect").remove()
        $("<div>").attr("id","incorrect").text(`Incorrect username and/or password`).appendTo("#buttonContainer")
        console.log("incorrect")
    };
}

$("#registerbtn").click(sendLogin)