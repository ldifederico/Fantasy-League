async function loadProfile () {
    let userID = {userID: localStorage.getItem("userID")};
    let userInfo = await $.ajax({
        method: "POST",
        url: "/profile",
        data: userID
    });
    
    $("#username").text(`Username: ${userInfo[0].username}`)
    $("#firstname").text(`First Name: ${userInfo[0].firstName}`)
    $("#lastname").text(`Last Name: ${userInfo[0].lastName}`)
    $("#email").text(`Email: ${userInfo[0].email}`)
    if (userInfo[0].companyName !== undefined) {
        $("#company").text(`Company: ${userInfo[0].companyName}`)
    };
};

async function updatePoints() {
    let data = {userID: localStorage.getItem("userID")};
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Points: ${points[0].points}`);
};

$("#searchSubmit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$("#signOut").click(function() {
    $.post("/signout");
});

loadProfile();
updatePoints();
