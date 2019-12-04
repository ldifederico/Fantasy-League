async function sendLogin(event){
    event.preventDefault();
    login = {};
    login.username = $("#username").val();
    login.password = $("#psw").val();
    let result = await $.ajax({
        method: "POST",
        url: "/",
        data: login
    });
    if (result.text == "incorrect login") {
        $("#incorrect").remove();
        $("<div>").attr("id","incorrect").text(`Incorrect username and/or password`).appendTo("#buttonContainer");
    }
    else {
        for (data of Object.entries(result)) {
            localStorage.setItem(data[0],data[1]);
        };
        window.location.href = "/main";
    };
};

$("#registerbtn").click(sendLogin);
