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
        $("<div>").attr("id","incorrect").css('color', 'red').addClass("mt-3").text(`Incorrect username and/or password`).appendTo("#buttonContainer");
    }
    else {
        for (data of Object.entries(result)) {
            localStorage.setItem(data[0],data[1]);
        };
        window.location.href = "/main";
    };
};

async function forgot(info) {
    $("#contentContainer").empty()
    $("<p>").text("Please enter your email below").appendTo("#contentContainer");
    $("<input>").attr({
        id: "emailInput",
        placeholder: "example@gmail.com",
    }).appendTo("#contentContainer");
    $("<button>").attr({
        id: "resetButton",
        class: "btn btn-outline-dark mt-3 ",
        type: "button"
    }).text("Send email").insertAfter("#contentContainer")
    $("#resetButton").click(() => sendEmail(info));
};

async function sendEmail(info) {
    var data = {email: $("#emailInput").val()};
    $.ajax({
        method: "POST",
        url: `/forgot${info}`,
        data: data
    });
    $("#contentContainer").empty();
    $("#resetButton").hide();
    $("<p>").addClass("text-center").text(`Email sent to ${data.email}`).appendTo("#contentContainer");
    $("<button>").attr({
        id: "logIn",
        class: "btn btn-outline-dark mt-3 ",
        type: "button"
    }).text("Log In").insertAfter("#contentContainer");
    $("#logIn").click(()=> {location.reload()});
};

$("#registerbtn").click(sendLogin);
$("#forgotUsername").click(() => forgot("Username"));
$("#forgotPassword").click(() => forgot("Password"));

// Detect Caps Lock
var psw = document.getElementById("psw");
var text = document.getElementById("warning");

psw.addEventListener("keyup", function(event) {
  if (event.getModifierState("CapsLock")) {
    text.style.display = "block";
  } else {
    text.style.display = "none"
  }
});

function showPassword() {
    var x = document.getElementById("psw");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
}