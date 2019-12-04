var userInfo;
var currentUserData = {};
var newUserData = {};

async function loadProfile () {
    let userID = {userID: localStorage.getItem("userID")};
    userInfo = await $.ajax({
        method: "POST",
        url: "/profile",
        data: userID
    });
    
    $("#username").text(userInfo[0].username)
    $("#firstName").text(userInfo[0].firstName)
    $("#lastName").text(userInfo[0].lastName)
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

async function editProfile() {
    currentUserData = {}
    $("#edit").toggle();
    $("#save").toggle();
    $(".profileItem").each( function(index) {
        currentUserData[$(this).attr("id")] = $(this).text();
    });
    $(".profileItem").each( function(index) {
        $(this).replaceWith(`<li class="list-group-item profileItem mt-n1 ml-n5"><input type="text" id="${$(this).attr("id")}" value="${$(this).text()}"></input></li>`);
    });
    $("#save").click(async function() {
        saveProfile();
    });
};

async function saveProfile() {
    updatedUserData = {}
    $(".profileItem").each( function(index) {
        if ($(this).children().val() !== $(this).children().attr("value")) {
            updatedUserData[$(this).children().attr("id")] = $(this).children().val();
        };
    });
    if (Object.keys(updatedUserData).length > 0) {
        updatedUserData.userID = localStorage.getItem("userID");
        let response = await $.ajax({
            method: "POST",
            url: "/updateUserProfile",
            data: updatedUserData
        });
        if (response.text == "Username taken") {
            $("#takenError").remove();
            $("<p>").text("Username is taken").addClass("mb-n2").attr("id","takenError").css({"color":"red"}).insertAfter("#delete");
        }
        else {
            location.reload();
        };
    } 
    else {
        location.reload();
    };
};

async function deleteAccount() {
    if ($("#confirmDeleteInput").val() == "Confirm") {
        userID = {userID: localStorage.getItem("userID")};
        $.ajax({
            method: "POST",
            url: "/deleteAccount",
            data: userID
        });
        window.location.href = "/login.html";
    };
};

$("#searchSubmit").click(function() {
    window.location.href = "/team.html";
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$("#signOut").click(function() {
    $.post("/signout");
});

$("#edit").on("click", editProfile);
$("#delete").on("click", function() {$('#myModal').modal('toggle')});
$("#confirmDeleteButton").on("click", deleteAccount);

loadProfile();
updatePoints();


var settings = {
	"async": true,
	"crossDomain": true,
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
	}
}
async function test() {
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    let allFixtures = await $.get(settings)
    var allFixturesCount = allFixtures.api.fixtures.length
    var futureFixturesCount = 0
    date_timestamp = Date.now().toString();
    date_timestamp = date_timestamp.slice(0,-3)
    for (fixture of Object.entries(allFixtures.api.fixtures)) {
        if (fixture[1].event_timestamp > date_timestamp) {
            futureFixturesCount++
        };
    };
    points = 1900 * (futureFixturesCount / allFixturesCount)
    console.log(points)
}

test();
