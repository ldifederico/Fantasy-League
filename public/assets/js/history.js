
async function loadHistory() {
    let betHistory = await $.ajax({
    method: "GET",
    url: "/betHistory"
    });
    console.log(betHistory)
    
    $("#company").text(" University of Toronto")
    $("#username").text(" Messi")

    i=1
    for (bet of betHistory) {
        console.log(bet.fixture)
        $("<tr>").attr("id","row"+i).appendTo("#betTable")
        $("<td>").text(bet.fixture).appendTo("#row"+i)
        $("<td>").text(bet.amountPlaced).appendTo("#row"+i)
        $("<td>").text(bet.team).appendTo("#row"+i)
        $("<td>").text(bet.amountwon).appendTo("#row"+i)
        i++
    }

} 

loadHistory()










