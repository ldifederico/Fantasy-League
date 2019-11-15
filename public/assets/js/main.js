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

async function getStandings() {
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`;
    let standings = await $.get(settings);
    i=1
    for (team of standings.api.standings[0]){
        $("<tr>").attr("id","row"+i).appendTo("#leagueBody");
        $("<th>").attr({
            scope: "row",
            id: "header"+i,
        }).text(i).appendTo("#row"+i)
        $("<td>").text(team.teamName).appendTo($("#row"+i));
        $("<td>").text(team.all.matchsPlayed).appendTo($("#row"+i));
        $("<td>").text(team.all.win).appendTo($("#row"+i));
        $("<td>").text(team.all.draw).appendTo($("#row"+i));
        $("<td>").text(team.all.lose).appendTo($("#row"+i));
        $("<td>").text(team.all.goalsFor).appendTo($("#row"+i));
        $("<td>").text(team.all.goalsAgainst).appendTo($("#row"+i));
        $("<td>").text(team.goalsDiff).appendTo($("#row"+i));
        $("<td>").text(team.points).appendTo($("#row"+i));
        i++
    }
}

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

    $("<h6>").text(gameWeek).appendTo("#fixtures")
    var weekFixtures = [];
    for (fixture of fixtures) {
        if (fixture.round == gameWeek) {weekFixtures.push(fixture)};
    }
    i = 1
    for (fixture of weekFixtures) {
        if (fixture.status == "Not Started") {
            $("<div>").attr("id","row"+i).addClass("row").appendTo("#fixtures")
            $("<p>").attr("id","fixture"+i).addClass("card-text").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} (${fixture.event_date})`).appendTo("#row"+i)
            $("<input>").attr({
                class: "form-control form-control-sm",
                id: "placeBet",
                type: "text",
                placeholder: "Bet Amount",
                style: "width: 50px"
            }).appendTo("#fixture"+i)
        }
        else {
            $("<p>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} ${fixture.status} ${fixture.goalsHomeTeam} ${fixture.goalsAwayTeam}`).appendTo("#fixtures");
        }
        i++
    }
}

async function refreshGames(incompleteGames) {
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    data = await $.get(settings);
    seasonFixtures = data.api.fixtures;
    for (game of incompleteGames) {
        for (fixture of seasonFixtures) {
            if (game.fixtureID == fixture.fixture_id) {
                if (fixture.goalsHomeTeam > fixture.goalsAwayTeam) {game.result = fixture.homeTeam.team_name}
                else if (fixture.goalsHomeTeam < fixture.goalsAwayTeam) {game.result = fixture.awayTeam.team_name}
                else if (fixture.goalsHomeTeam = fixture.goalsAwayTeam) {game.result = "Draw"}
            }
        }
    }
}

// async function requestTeam(teamName) {
//     $.ajax({
//         url: "/team",
//         data: teamName,
//         method: "POST"
//     });
//     console.log(teamName)
// }

async function mainLoad() {
    loadFixtures(Date.now())
    getStandings()
}

mainLoad()

var incompleteGames = [{fixtureID: 157026, result: ""},{fixtureID: 157027, result: ""}]
refreshGames(incompleteGames)

$("#submit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = `teamName=${$("#teamName").val()}`
});
