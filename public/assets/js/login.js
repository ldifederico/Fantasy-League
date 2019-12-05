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

// async function forgotPassword() {
//     $("#contentContainer").empty()
//     $("<input>").attr({
//         id: "emailInput",
//         placeholder: "example@gmail.com",
//     }).appendTo("#contentContainer");
//     $("<button>").attr({
//         id: "resetButton",
//         class: "btn btn-outline-dark mt-3 ",
//         type: "button"
//     }).text("Reset password").insertAfter("#contentContainer")
//     $("#resetButton").click(sendPasswordEmail);
// };

// async function forgot(info) {
//     $("#contentContainer").empty()
//     $("<p>").text("Please enter your email below").appendTo("#contentContainer");
//     $("<input>").attr({
//         id: "emailInput",
//         placeholder: "example@gmail.com",
//     }).appendTo("#contentContainer");
//     $("<button>").attr({
//         id: "resetButton",
//         class: "btn btn-outline-dark mt-3 ",
//         type: "button"
//     }).text("Send email").insertAfter("#contentContainer")
//     $("#resetButton").click(() => sendEmail(info));
// };

// async function sendEmail(info) {
//     var data = {email: $("#emailInput").val()};
//     $.ajax({
//         method: "POST",
//         url: `/forgot${info}`,
//         data: data
//     });
//     $("#contentContainer").empty();
//     $("#resetButton").hide();
//     $("<p>").addClass("text-center").text(`Email sent to ${data.email}`).appendTo("#contentContainer");
//     $("<button>").attr({
//         id: "logIn",
//         class: "btn btn-outline-dark mt-3 ",
//         type: "button"
//     }).text("Log In").insertAfter("#contentContainer");
//     $("#logIn").click(()=> {location.reload()});
// };


// $("#registerbtn").click(sendLogin);
// $("#forgotUsername").click(() => forgot("Username"));
// $("#forgotPassword").click(() => forgot("Password"));
