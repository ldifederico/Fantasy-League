
async function loadHistory() {
    let userID = {userID: localStorage.getItem("userID")}
    let betHistory = await $.ajax({
        method: "POST",
        url: "/betHistory",
        data: userID
    });
    $("#company").text(` ${betHistory[0].name}`);
    $("#username").text(` ${betHistory[0].username}`);
    
    for ([index,bet] of betHistory.entries()) {
        i = index + 1
        $("<tr>").attr("id","row"+i).appendTo("#betTable")
        if (bet.score !== null) {score = ` (${bet.score})`}
        else {score = ""}
        $("<td>").text(`${bet.fixture}${score}`).appendTo("#row"+i)
        $("<td>").text(bet.fixture_date).appendTo("#row"+i)
        $("<td>").text(bet.team).appendTo("#row"+i)
        $("<td>").text(bet.amountPlaced).appendTo("#row"+i)
        $("<td>").text(bet.odds).appendTo("#row"+i)
        if (bet.amountwon > 0) {colour = "green"}
        else {colour = "red"};
        $("<td>").text(bet.amountwon).css("color",colour).appendTo("#row"+i)
    };
};

async function updatePoints() {
    let data = ({userID: localStorage.getItem("userID")})
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Points: ${points[0].points}`)
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

loadHistory();
updatePoints();










