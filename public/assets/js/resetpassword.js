async function setNewPassword() {
    if ($("#psw1").val() == $("#psw2").val()) {
        console.log("same password")
        userID = window.location.href.split("/")[4]
        data = {password: $("#psw1").val(), userID: userID}
        console.log(data)
        let response = await $.ajax({
            method: "POST",
            url: "/setnewpassword",
            data: data
        });
        $("<p>").addClass("text-center mb-n3 mt-n2").css("color","green").text("Please log in.").insertAfter("#psw2");
        $("<p>").addClass("text-center mt-3").css("color","green").text("Password changed successfully.").insertAfter("#psw2");
        $("#setPasswordButton").hide();
        $("#logIn").show();
    }
    else {
        $("<p>").addClass("text-center").css("color","red").text("Passwords do not match").insertAfter("#psw2");
    };
};

$("#setPasswordButton").click(setNewPassword);
$("#logIn").click(()=> {window.location.href = "/login.html"});
