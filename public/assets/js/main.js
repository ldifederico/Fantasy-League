var settings = {
	"async": true,
	"crossDomain": true,
	"url": "",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
	}
}


// async function loadFixtures(gameWeek) {
//     settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
//     data = await $.get(settings);
//     fixtures = data.api.fixtures;

//     date_timestamp = Date.now().toString();
//     date_timestamp = date_timestamp.slice(0,-3);

//     var weekFixtures = [];
//     for (fixture of fixtures) {
//         if (fixture.round == gameWeek) {weekFixtures.push(fixture)};
//     };
//     for (fixture of weekFixtures) {
//         // $("<div>").addClass("row").appendTo("#")
//         $("<p>").attr("id","fixture"+i).addClass("card-text").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} (${fixture.event_date}) ${fixture.status} ${fixture.goalsHomeTeam} ${fixture.goalsAwayTeam}`).appendTo("#fixtures")
//         $("<div>").attr({
//             class: "form-control form-control-sm",
//             id: "placeBet",
//             type: "text",
//             placeholder: "Bet Amount",
//         }).appendTo("#fixture"+i)
//     };
// }

async function loadStandings() {
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`;
    let standings = await $.get(settings);
    i=1
    for (team of standings.api.standings[0]){
        $("<tr>").attr("id","standRow"+i).appendTo("#leagueBody");
        $("<th>").attr({
            scope: "row",
            id: "header"+i,
        }).text(i).appendTo("#standRow"+i)
        $("<td>").text(team.teamName).appendTo($("#standRow"+i));
        $("<td>").text(team.all.matchsPlayed).appendTo($("#standRow"+i));
        $("<td>").text(team.all.win).appendTo($("#standRow"+i));
        $("<td>").text(team.all.draw).appendTo($("#standRow"+i));
        $("<td>").text(team.all.lose).appendTo($("#standRow"+i));
        $("<td>").text(team.all.goalsFor).appendTo($("#standRow"+i));
        $("<td>").text(team.all.goalsAgainst).appendTo($("#standRow"+i));
        $("<td>").text(team.goalsDiff).appendTo($("#standRow"+i));
        $("<td>").text(team.points).appendTo($("#standRow"+i));
        i++
    };
};

async function loadFixtures(gameWeek) {
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    data = await $.get(settings);
    fixtures = data.api.fixtures;
    if (!isNaN(gameWeek)) {
        date_timestamp = gameWeek.toString();
        date_timestamp = date_timestamp.slice(0,-3);
        var futureFixtures = []
        for (fixture of fixtures) {
            if (fixture.event_timestamp > date_timestamp) {futureFixtures.push(fixture)}
        }
        gameWeek = futureFixtures[0].round
    }

    $("<h6>").text("Game Week " + gameWeek.replace(/[^0-9]/g,'')).appendTo("#fixtures")
    var weekFixtures = [];
    for (fixture of fixtures) {
        if (fixture.round == gameWeek) {weekFixtures.push(fixture)};
    };

    let betHistory = await $.get("/betHistory");

    i = 1
    for (fixture of weekFixtures) {
    
        settings.url = `https://api-football-v1.p.rapidapi.com/v2/odds/fixture/${fixture.fixture_id}`;
        data = await $.get(settings);
        try {
            fixtureOdds = data.api.odds[0].bookmakers[0].bets[0];
        }
        catch {
            fixtureOdds.values[0].odd = 2.55
            fixtureOdds.values[1].odd = 5.10
            fixtureOdds.values[2].odd = 1.20
        }

        if (fixture.status == "Not Started") {
            $("<div>").attr("id","fixRow"+i).addClass("container").appendTo("#fixtures")
            $("<p>").addClass("card-text").text(`${fixture.event_date.substring(0,10)}`).appendTo("#fixRow"+i)
            $("<p>").attr({
                id: "fixture"+i,
                fixtureID: fixture.fixture_id,
                homeTeam: fixture.homeTeam.team_name,
                awayTeam: fixture.awayTeam.team_name,
                odds: 2
            }).addClass("card-text").text(`${fixture.homeTeam.team_name} (H) vs. ${fixture.awayTeam.team_name} (A)`).appendTo("#fixRow"+i)
            betPlaced = false
            for (bet of betHistory) {
                if (fixture.fixture_id == bet.fixture_id) {
                    betInfo = bet
                    betPlaced = true
                };
            };
            if (betPlaced == false) {
                $("<input>").attr({
                    class: "form-control form-control-sm",
                    id: "placeBet"+i,
                    type: "text",
                    placeholder: "Bet Amount",
                    style: "width: 100%"
                }).appendTo("#fixture"+i);
                $("<button>").attr({
                    class: "btn btn-outline-dark btn-sm betButton",
                    id: "homeBet"+i,
                    type: "button",
                    style: "font-size: x-small; margin: 1%"
                }).appendTo("#fixture"+i);
                $("<button>").attr({
                    class: "btn btn-outline-dark btn-sm betButton",
                    id: "visitorBet"+i,
                    type: "button",
                    style: "font-size: x-small; margin: 1%"
                }).appendTo("#fixture"+i);
                $("<button>").attr({
                    class: "btn btn-outline-dark btn-sm betButton",
                    id: "draw"+i,
                    type: "button",
                    style: "font-size: x-small; margin: 1%"
                }).appendTo("#fixture"+i);

                document.getElementById("homeBet"+i).innerHTML = `Home: ${fixtureOdds.values[0].odd}`;
                document.getElementById("visitorBet"+i).innerHTML = `Away: ${fixtureOdds.values[2].odd}`;
                document.getElementById("draw"+i).innerHTML = `Draw: ${fixtureOdds.values[1].odd}`;
            }
            else {
                $("<div>").text(`${betInfo.amountPlaced} points for ${betInfo.team}`).appendTo("#fixture"+i)
            };
        }
        else {
            $("<div>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} ${fixture.status} ${fixture.goalsHomeTeam} - ${fixture.goalsAwayTeam}`).appendTo("#fixtures");
        };
        i++
    }
    $(".betButton").on("click", placeBet)
};

async function loadCompany() {
    let company = await $.ajax({
        method: "GET",
        url: "/group"
    });
    if (company !== "") {
        $("#companySelect").attr("style","display: none")
        $("#companyDisplay").attr("style","display: block")
        i=1
        for (user of company) {
            $("<tr>").attr("id","row"+i).appendTo("#companyTable")
            $("<th>").attr("scope","row").text(i).appendTo("#row"+i)
            $("<td>").text(user.username).appendTo("#row"+i)
            $("<td>").text(user.points).appendTo("#row"+i)
            i++
        };
    };
};

async function placeBet() {
    number = this.id.replace(/[^0-9]/g,'')
<<<<<<< HEAD
    fixture = $("#fixture" + number);
    var bet = {}
    bet.fixtureID = fixture.attr("fixtureid");
    bet.fixture = `${fixture.attr("homeTeam")} vs. ${fixture.attr("awayTeam")}`;
    team = $(this).text()
    switch(team) {
        case "Home": bet.team = fixture.attr("homeTeam") 
        break;
        case "Away": bet.team = fixture.attr("awayTeam") 
        break;
        case "Draw": bet.team = "Draw"
        break;
    }
    bet.amount = $("#placeBet" + number).val()
    bet.odds = 2
    let status = await $.ajax({
        method: "POST",
        url: "/placeBet",
        data: bet
    });
    if (status == "placed") {
        $(`#placeBet${number}, #homeBet${number}, #visitorBet${number}, #draw${number}`).hide()
        // $("<div>").text(`${bet.amount} points for ${bet.team} at odds of ${bet.odds}`).appendTo("#fixture"+number)
        $("<div>").text(`${bet.amount} points for ${bet.team}`).appendTo("#fixture"+number)
        updatePoints()
    }
    else if(status == "no funds") {
=======
    if ($("#placeBet" + number).val() < 5) {
>>>>>>> dbc5bc2afdc31f934d3a08e3414d0bb2286031ae
        $("#funds"+number).remove()
        $("<div>").attr("id","funds"+number).text(`Bet minimum of 5 points.`).appendTo("#fixture"+number)
    }
    else {
        fixture = $("#fixture" + number);
        var bet = {}
        bet.fixtureID = fixture.attr("fixtureid");
        bet.fixture = `${fixture.attr("hometeam")} vs. ${fixture.attr("awayteam")}`;
        team = $(this).text().substring(0,4)
        switch(team) {
            case "Home": bet.team = fixture.attr("hometeam") 
            break;
            case "Away": bet.team = fixture.attr("awayteam") 
            break;
            case "Draw": bet.team = "Draw"
            break;
            default: console.log("default");
        };
        bet.amount = $("#placeBet" + number).val();
        bet.odds = $(this).text().replace(/[^0-9]/g,'').substring(0,1) + "." + $(this).text().replace(/[^0-9]/g,'').substring(1,2) 
        status = await $.ajax({
            method: "POST",
            url: "/placeBet",
            data: bet
        });
        if (status == "placed") {
            $("#funds"+number).remove()
            $(`#placeBet${number}, #homeBet${number}, #visitorBet${number}, #draw${number}`).hide()
            $("<div>").text(`${bet.amount} points for ${bet.team}`).appendTo("#fixture"+number)
            updatePoints()
        }
        else if (status == "no funds") {
            $("#funds"+number).remove()
            $("<div>").attr("id","funds"+number).text(`Insufficient points to place bet`).appendTo("#fixture"+number)
        };
    };
};

async function updatePoints() {
    let points = await $.get("/getPoints")
    $("#points").text(`Points: ${points[0].points}`)
}

async function mainLoad() {
    loadFixtures(Date.now());
    loadStandings();
    loadCompany();
    updatePoints();
}

mainLoad();


$("#searchSubmit").click( function() {
    window.location.href = "/team.html";
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$("#createCompanyGroup").click( async function() {
    data = $("#nameCompanyGroup").val()
    data = ({groupName: data})
    response = await $.ajax({
        url: "/createGroup",
        data: data,
        method: "POST"
    })
    if (response == "") {
        $("<p>").attr("id","exists").text("Company already exists. Choose another name.").appendTo("#companySelect")
    }
    else {
        loadCompany();
        updatePoints();
    };
});

$("#joinCompanyGroup").click( async function() {
    event.preventDefault();
    data = $("#joinGroup").val();
    data = ({groupName: data});
    let groupSearch = await $.ajax({
        url: "/searchGroup",
        data: data,
        method: "POST"
    });
    i=1
    for (group of groupSearch) {
        $("<tr>").attr({
            id: "searchRow"+i,
            class: "result"
        }).appendTo("#searchTable")
        $("<td>").addClass("result").text(group.name).appendTo("#searchRow"+i)

        i++
    };
    $(".result").on("click", async function() {
        data = this.id.replace(/[^0-9]/g,'');
        data = ({companyID: data});
        let company = await $.ajax({
            url: "/joinGroup",
            data: data,
            method: "POST"
        });
        $(".result").remove();
        loadCompany(company);
        updatePoints();
    });
});

