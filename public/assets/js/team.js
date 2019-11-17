// const main = require(`main.js`);
var url;
// var teamName = "Manchester United";

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
    allCookies = document.cookie.split(';');
    for (cookie of allCookies) {
        if (cookie.includes("teamName=")) {
            teamName = cookie.substring(10);
            document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/teams/search/${teamName}`;
    data = await $.get(settings);
    teamData = data.api.teams[0];
    $("#club").text(teamData.name);
    $("#teamLogo").attr("src", teamData.logo);

    //Roster
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/players/squad/${teamData.team_id}/2019-2020`;
    let roster = await $.get(settings);
    i=1
    for (player of roster.api.players) {
        $("<tr>").attr("id","rosterRow"+i).appendTo("#rosterBody");
        $("<td>").text(player.number).appendTo($("#rosterRow"+i));
        $("<td>").text(player.position).appendTo($("#rosterRow"+i));
        $("<td>").text(`${player.firstname} ${player.lastname}`).appendTo($("#rosterRow"+i));
        i++
    }

    //Fixtures
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/fixtures/team/${teamData.team_id}/524?timezone=Europe%2FLondon`;
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
    // settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`
    // let standings = await $.get(settings)
    // for (team of standings.api.standings[0]){
    //     $("<p>").css("font-size", "15px").text(`${team.teamName} W/L/D: ${team.all.win}/${team.all.lose}/${team.all.draw}`).appendTo("#standing")
    // }
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

$("#submit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = `teamName=${$("#teamName").val()}`
    console.log("sucess")
});

$("#searchSubmit").click(function() {
    window.location.href = "/team.html"
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

getTeam()

    