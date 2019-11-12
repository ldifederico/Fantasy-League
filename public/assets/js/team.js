var url
var teamName = "Manchester United"

var settings = {
	"async": true,
	"crossDomain": true,
	"url": url,
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
	}
};

async function getTeam() {
    //Team
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/teams/search/${teamName}`
    data = await $.get(settings)
    let teamData = data.api.teams[0]
    $("#teamName").text(teamData.name)
    $("#teamPhoto").attr("src", teamData.logo)

    //Roster
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/players/squad/${teamData.team_id}/2019-2020`
    let roster = await $.get(settings)
    for (player of roster.api.players){
        $("<p>").css("font-size", "15px").text(`${player.firstname} ${player.lastname}`).appendTo("#roster")
    }

    //Fixtures
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/fixtures/team/${teamData.team_id}/524?timezone=Europe%2FLondon`
    data = await $.get(settings);
    let fixtures = data.api.fixtures;
    date_timestamp = Date.now().toString();
    date_timestamp = date_timestamp.slice(0,-3);
    var futureFixtures = []
    var pastFixtures = []
    for (fixture of fixtures) {
        if (fixture.event_timestamp > date_timestamp) {futureFixtures.push(fixture)}
        else {pastFixtures.push(fixture)}
    }
    for (fixture of futureFixtures) {
        $("<p>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} (${fixture.event_date.slice(0,10)})`).appendTo("#fixtures")
    }
    for (fixture of pastFixtures) {
        $("<p>").css("font-size", "15px").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name} ${fixture.goalsHomeTeam} - ${fixture.goalsAwayTeam}`).appendTo("#results")
    }

    //Standings
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`
    let standings = await $.get(settings)
    for (team of standings.api.standings[0]){
        $("<p>").css("font-size", "15px").text(`${team.teamName} W/L/D: ${team.all.win}/${team.all.lose}/${team.all.draw}`).appendTo("#standing")
    }
}

getTeam()

