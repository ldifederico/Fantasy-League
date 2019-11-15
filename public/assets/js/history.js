
async function loadHistory() {
    let betHistory = await $.ajax({
    method: "GET",
    url: "/betHistory"
    });    
    $("#company").text(` ${betHistory[0].name}`)
    $("#username").text(` ${betHistory[0].username}`)
    i=1
    for (bet of betHistory) {
        $("<tr>").attr("id","row"+i).appendTo("#betTable")
        $("<td>").text(bet.fixture).appendTo("#row"+i)
        $("<td>").text(bet.amountPlaced).appendTo("#row"+i)
        $("<td>").text(bet.team).appendTo("#row"+i)
        $("<td>").text(bet.odds).appendTo("#row"+i)
        $("<td>").text(bet.amountwon).appendTo("#row"+i)
        i++
    }
} 

$("#searchSubmit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

loadHistory()










