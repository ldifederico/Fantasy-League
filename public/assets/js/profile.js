async function loadProfile () {
    let userInfo = await $.ajax({
        method: "GET",
        url: "/profile"
    });
    console.log(userInfo)
    
    $("#username").text(`Username: ${userInfo[0].username}`)
    $("#firstname").text(`First Name: ${userInfo[0].firstName}`)
    $("#lastname").text(`Last Name: ${userInfo[0].lastName}`)
    $("#email").text(`Email: ${userInfo[0].email}`)
    if (userInfo[0].companyName !== undefined) {
        $("#company").text(`Company: ${userInfo[0].companyName}`)
    };
};

async function updatePoints() {
    let points = await $.get("/getPoints")
    $("#points").text(`Points: ${points[0].points}`)
};

$("#searchSubmit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
    console.log(document.cookie)
});

$("#signOut").click(function() {
    $.post("/signout");
});

loadProfile();
updatePoints();
