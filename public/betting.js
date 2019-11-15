$("#homeBet").click(function () {
    var home = $("#homeTeam").val();
    var bet = $("#betAmount").val();
    data = ({ home : bet})

    if(bet>5) {
        alert(`Minimum bet is 5 points.`)
    } else {
        $.ajax({
            url: "/homeBet",
            data: data,
            method: "POST"
        }) 
    } 
})

$("#visitorBet").click(function () {
    var away = $("#AwayTeam").val();
    var bet = $("#betAmount").val();
    data = ({ away : bet})

    if(bet>5) {
        alert(`Minimum bet is 5 points.`)
    } else {
        $.ajax({
            url: "/awayBet",
            data: data,
            method: "POST"
        }) 
    } 
})

$("#draw").click(function () {
    var bet = $("#betAmount").val();
    data = ({ "draw" : bet})

    if(bet>5) {
        alert(`Minimum bet is 5 points.`)
    } else {
        $.ajax({
            url: "/draw",
            data: data,
            method: "POST"
        }) 
    }
})