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
    
    $("#username").text(userInfo[0].username);
    $("#firstName").text(userInfo[0].firstName);
    $("#lastName").text(userInfo[0].lastName);
    $("#email").text(userInfo[0].email);
    if (userInfo[0].companyName !== undefined) {
        $("#company").text(userInfo[0].companyName);
    }
    else {
        $("#leave").hide();
    };
};

async function updatePoints() {
    let data = {userID: localStorage.getItem("userID")};
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Pts: ${points[0].points}`);
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
    updatedUserData = {};
    $(".profileItem").each( function(index) {
        if ($(this).children().val() !== $(this).children().attr("value")) {
            updatedUserData[$(this).children().attr("id")] = $(this).children().val();
        };
    });
    if (Object.keys(updatedUserData).length > 0) {
        updatedUserData.userID = localStorage.getItem("userID");
        console.log(`userdata: ${updatedUserData}`);
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

async function showDeleteModal() {
    $("#modalTitle").text("Confirm account delete");
    $("#modalBody").text("Are you sure you want to delete your account? There is no going back. Please type in your password below and click Delete.");
    $("#confirmButton").text("Delete");
    $('#myModal').modal('toggle');
    $("#confirmButton").on("click", deleteAccount);
};

async function deleteAccount() {
    userID = {userID: localStorage.getItem("userID")};
    let response = $.ajax({
        method: "POST",
        url: "/deleteAccount",
        data: userID
    });
    if (response == "incorrect password") {
        $("#confirmError").remove();
        $("<p>").attr("id","confirmError").addClass("ml-3 mt-n2").css("color","red").text("Incorrect password").insertAfter("#confirmInput");
    }
    else if (response == "correct password") {
        window.location.href = "/login.html";
    }
};

async function showLeaveModal() {
    $("#modalTitle").text("Confirm leave company");
    $("#modalBody").text("Are you sure you want to leave your company? You will lose your all you points and previous bets associated with your company. Please type in your password below and click Leave.");
    $("#confirmButton").text("Leave");
    $('#myModal').modal('toggle');
    $("#confirmButton").on("click", leaveCompany);
};

async function leaveCompany() {
    userID = {userID: localStorage.getItem("userID"), password: $("#confirmInput").val()};
    let response = await $.ajax({
        method: "POST",
        url: "/leaveCompany",
        data: userID
    });
    if (response == "incorrect password") {
        $("#confirmError").remove();
        $("<p>").attr("id","confirmError").addClass("ml-3 mt-n2").css("color","red").text("Incorrect password").insertAfter("#confirmInput");
    }
    else if (response == "correct password"){
        localStorage.removeItem("companyID");
        location.reload();
    };
};

$("#searchSubmit").click(function() {
    window.location.href = "/team.html";
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$("#signOut").click(function() {
    localStorage.removeItem("companyID");
    localStorage.removeItem("userID");
    $.post("/signout");
});
$("#edit").on("click", editProfile);
$("#delete").on("click", showDeleteModal);
$("#leave").on("click", showLeaveModal);

async function verify() {
    let response =  await $.ajax({
        method: "POST",
        url: "/verification",
        data: {userID: localStorage.getItem("userID")}
    });
    if (response == "verified") {
        loadProfile();
        updatePoints();    
    }
    else {
        window.location.href = "/login.html";
    };
};

verify();