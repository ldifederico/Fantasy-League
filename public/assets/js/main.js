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

async function loadFixtures(gameWeek) {
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    data = await $.get(settings);
    fixtures = data.api.fixtures;

    date_timestamp = Date.now().toString();
    date_timestamp = date_timestamp.slice(0,-3);

    var weekFixtures = [];
    for (fixture of fixtures) {
        if (fixture.round == gameWeek) {weekFixtures.push(fixture)};
    }
    for (fixture of weekFixtures) {
        $("<p>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} (${fixture.event_date}) ${fixture.status} ${fixture.goalsHomeTeam} ${fixture.goalsAwayTeam}`).appendTo("#fixtures")
        //https://api-football-v1.p.rapidapi.com/v2/fixtures/rounds/4
    }
}

async function getStandings() {
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`;
    let standings = await $.get(settings);
    for (team of standings.api.standings[0]){
        $("<p>").css("font-size", "15px").text(`${team.teamName} W/L/D: ${team.all.win}/${team.all.lose}/${team.all.draw}`).appendTo("#standings");
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
    for (fixture of weekFixtures) {
        if (fixture.status == "Not Started"){
            $("<p>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} (${fixture.event_date})`).appendTo("#fixtures");
        }
        else {
            $("<p>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} ${fixture.status} ${fixture.goalsHomeTeam} ${fixture.goalsAwayTeam}`).appendTo("#fixtures");
        }
    }
}

async function requestTeam(teamName) {
    $.ajax({
        url: "/team",
        data: teamName,
        method: "GET"
    });
}

async function mainLoad() {
    loadFixtures(Date.now())
    getStandings()
}

mainLoad()

// $("#submit").click(function(){requestTeam($("#teamName").val())})