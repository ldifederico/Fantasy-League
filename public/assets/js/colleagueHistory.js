async function loadHistory() {

    allCookies = document.cookie.split(';');
    for (cookie of allCookies) {
        if (cookie.includes("userSearch=")) {
            username = cookie.replace("userSearch=","");
            username = username.replace(" ","")
        };
    };
    var data = {username: username};
    let betHistory = await $.ajax({
        method: "POST",
        url: "/colleagueHistory",
        data: data
    });

    $("#company").text(` ${betHistory.companyName}`);
    $("#username").text(` ${betHistory.username}`);
    if (betHistory.bets.length > 0) {
    for ([index,bet] of betHistory.bets.entries()) {
            i = index + 1;
            $("<tr>").attr("id","row"+i).appendTo("#betTable");
            if (bet.score !== null) {score = ` (${bet.score})`}
            else {score = ""};
            $("<td>").text(`${bet.fixture}${score}`).appendTo("#row"+i);
            $("<td>").text(bet.fixture_date).appendTo("#row"+i);
            $("<td>").text(bet.team).appendTo("#row"+i);
            $("<td>").text(bet.amountPlaced).appendTo("#row"+i);
            $("<td>").text((Math.round(bet.odds * 100) / 100).toFixed(2)).appendTo("#row"+i);
            if (bet.amountwon > 0) {colour = "green"}
            else {colour = "red"};
            $("<td>").text(bet.amountwon).css("color",colour).appendTo("#row"+i);
        };
    }
    else {
        $("<div>").text("This user has not placed any bets").addClass("text-center").css("font-size","16px").insertAfter("#historyTable");
    };
};

async function updatePoints() {
    let data = ({userID: localStorage.getItem("userID")})
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Pts: ${points[0].points}`)
};

$("#searchSubmit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$("#signOut").click(function() {
    localStorage.removeItem("companyID");
    localStorage.removeItem("userID");
    $.post("/signout");
});


async function verify() {
    let response =  await $.ajax({
        method: "POST",
        url: "/verification",
        data: {userID: localStorage.getItem("userID")}
    });
    if (response == "verified") {
        loadHistory();
        updatePoints();
    }
    else {
        window.location.href = "/login.html";
    };
};

verify();
