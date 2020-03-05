async function loadHistory() {
    let userData = {userID: localStorage.getItem("userID"), companyID: localStorage.getItem("companyID")};
    let betHistory = await $.ajax({
        method: "POST",
        url: "/betHistory",
        data: userData
    });
    $("#username").text(` ${betHistory.userName}`);
    if (betHistory.companyName !== undefined) {
        $("#company").text(` ${betHistory.companyName}`)
        if (betHistory.userBets.length > 0) {
            for ([index,bet] of betHistory.userBets.entries()) {
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
            $("<div>").text("You have not placed any bets. Please place bets to view your bet history.").addClass("text-center").css("font-size","16px").insertAfter("#historyTable");
        }
    }
    else {
        $("#companyIcon").hide();
        $("<div>").text("You have not placed any bets. Please join a company and place your bets!").addClass("text-center").css("font-size","16px").insertAfter("#historyTable");
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