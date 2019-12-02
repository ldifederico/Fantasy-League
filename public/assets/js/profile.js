var userInfo
var currentUserData = {}
var updatedUserData = {}

async function loadProfile () {
    let userID = {userID: localStorage.getItem("userID")};
    userInfo = await $.ajax({
        method: "POST",
        url: "/profile",
        data: userID
    });
    
    $("#username").text(userInfo[0].username)
    $("#firstname").text(userInfo[0].firstName)
    $("#lastname").text(userInfo[0].lastName)
    $("#email").text(userInfo[0].email)
    if (userInfo[0].companyName !== undefined) {
        $("#company").text(userInfo[0].companyName)
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

async function editProfileAction() {
    $("#edit").toggle();
    $("#save").toggle();
    $(".profileItem").each( function(index) {
        currentUserData[$(this).attr("id")] = $(this).text()
    });
    $(".profileItem").each( function(index) {
        $(this).replaceWith(`<li class="list-group-item profileItem mt-n1"><input type="text" id="${$(this).attr("id")}" value="${$(this).text()}"></input></li>`);
    });
    $("#save").click(async function() {
        saveProfile();
        location.reload();
    });
};

async function saveProfile() {
    $(".profileItem").each( function(index) {
        updatedUserData[$(this).children().attr("id")] = $(this).children().val()
    });
    if (JSON.stringify(currentUserData) !== JSON.stringify(updatedUserData)) {
        updatedUserData.userID = localStorage.getItem("userID");
        let temp = await $.ajax({
            method: "POST",
            url: "/updateUserProfile",
            data: updatedUserData
        });
    };
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

$("#edit").on("click",editProfileAction);


loadProfile();
updatePoints();
