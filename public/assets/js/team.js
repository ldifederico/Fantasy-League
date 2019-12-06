var settings = {
	"async": true,
	"crossDomain": true,
	"url": "",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
	}
};

var teams = [
    {
        teamName: "Bournemouth",
        containerBackground: "#8b0304",
        h2: "black"
    },
    /* Arsenal F.C. */
    {
        teamName: "Arsenal",
        containerBackground: "#ef0107",
        h2: "#023474"
    },
    /* Brighton & Hove Albion F.C. */
     {
        teamName: "Brighton",
        containerBackground: "#005daa",
        h2: "white"
    },
    /* Burnley F.C. */
    {
        teamName: "Burnley",
        containerBackground: "#97d7f5",
        h2: "white"
    },
    /* Aston Villa */
    {
        teamName: "Aston Villa",
        containerBackground: "#7b003a",
        h2: "#a3c5e9"
    },
    /* Chelsea F.C. */
    {
        teamName: "Chelsea",
        containerBackground: "#034694",
        h2: "white"
    },
    /* Crystal Palace F.C. */
    {
        teamName: "Crystal Palace",
        containerBackground: "#f4f4f4",
        h2: "#27409b"
    },
    /* Everton F.C. */
    {
        teamName: "Everton",
        containerBackground: "#274488",
        h2: "white"
    },
    /* Norwich F.C. */
    {
        teamName: "Norwich",
        containerBackground: "#00a650",
        h2: "#fff200"
    },
    /* Sheffield United */
    {
        teamName: "Sheffield",
        containerBackground: "#ec2227",
        h2: "white"
    },
    /* Leicester City F.C. */
    {
        teamName: "Leicester",
        containerBackground: "#0053a0",
        h2: "white"
    },
    /* Liverpool F.C. */
    {
        teamName: "Liverpool",
        containerBackground: "#dd0000",
        h2: "white"
    },
    /* Manchester City F.C. */
    {
        teamName: "Manchester City",
        containerBackground: "#6caddf",
        h2: "#00285e"
    },
    /* Manchester United F.C. */
    {
        teamName: "Manchester United",
        containerBackground: "#da020e",
        h2: "#ffe500"
    },
    /* Newcastle United F.C. */
    {
        teamName: "Newcastle",
        containerBackground: "#00b6f1",
        h2: "#231f20"
    },
    /* Southampton F.C. */
    {
        teamName: "Southampton",
        containerBackground: "#211e1f",
        h2: "#ffc20e"
    },
    /* Tottenham Hotspur F.C. */
    {
        teamName: "Tottenham",
        containerBackground: "#132257",
        h2: "white"
    },
    /* Watford F.C. */
    {
        teamName: "Watford",
        containerBackground: "#fbee23",
        h2: "black"
    },
    /* West Ham United F.C. */
    {
        teamName: "West Ham",
        containerBackground: "#7c2c3b",
        h2: "#f8d742"
    },
    /* Wolverhampton Wanderers F.C. */
    {
        teamName: "Wolves",
        containerBackground: "#fdb913",
        h2: "#231f20"
    }

];

async function getTeam() {
    //Team
    allCookies = document.cookie.split(';');
    for (cookie of allCookies) {
        if (cookie.includes("teamName=")) {
            teamName = cookie.substring(10);
            document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        };
    };
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/teams/search/${teamName}`;
    data = await $.get(settings);
    teamData = data.api.teams[0];
    var team = teams.filter(obj => {
        return obj.teamName == teamData.name
    });
    $(".club").text(`${teamData.name}`).css("color", team[0].h2);
    $(".teamLogo").attr("src", teamData.logo).css({"width": "40px", "height": "40px"});
    $("body").css({"background" : `${team[0].containerBackground}`});

    //Roster
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/players/squad/${teamData.team_id}/2019-2020`;
    let roster = await $.get(settings);
    i=1
    for (player of roster.api.players) {
        $("<tr>").addClass("rosterRow"+i).appendTo(".rosterBody");
        $("<td>").text(`${player.firstname} ${player.lastname}`).appendTo($(".rosterRow"+i));
        $("<td>").text(player.position).appendTo($(".rosterRow"+i));
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
    i = 1
    for (fixture of futureFixtures) {
        $("<tr>").addClass("fixtureRow"+i).appendTo(".fixtureBody").css("text-align", "center");
        $("<tr>").text(`${fixture.homeTeam.team_name} (H)`).appendTo($(".fixtureRow"+i)).css("font-weight", "800");
        $("<tr>").text(` vs. `).appendTo($(".fixtureRow"+i)).css("font-size", "smaller");
        $("<tr>").text(`${fixture.awayTeam.team_name} (A)`).appendTo($(".fixtureRow"+i)).css("font-weight", "800");
        $("<tr>").text(`${fixture.event_date.slice(0,10)}`).appendTo($(".fixtureRow"+i)).css("font-size", "smaller");
        $("<br>").appendTo($(".fixtureRow"+i));
        i++
    }
    i = 1
    for (fixture of pastFixtures) {
        $("<tr>").addClass("resultsRow"+i).appendTo(".resultsBody").css("text-align", "center");
        $("<tr>").text(`${fixture.homeTeam.team_name} (${fixture.goalsHomeTeam})`).appendTo($(".resultsRow"+i)).css("font-weight", "800");
        $("<tr>").text(` vs. `).appendTo($(".resultsRow"+i)).css("font-size", "smaller");
        $("<tr>").text(`${fixture.awayTeam.team_name} (${fixture.goalsAwayTeam}) `).appendTo($(".resultsRow"+i)).css("font-weight", "800");
        $("<tr>").text(`${fixture.event_date.slice(0,10)}`).appendTo($(".resultsRow"+i)).css("font-size", "smaller");
        $("<br>").appendTo($(".resultsRow"+i));
        i++
    }

    //standings
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`;
    let standings = await $.get(settings);
    console.log(standings)
    i=1
    for (team of standings.api.standings[0]){
        $("<tr>").addClass("row"+i).appendTo(".leagueBody");
        $("<th>").attr({
            scope: "row",
            class: "header"+i,
        }).text(i).appendTo(".row"+i);
        $("<td>").text(team.teamName).appendTo($(".row"+i));
        $("<td>").text(`${team.all.win}/${team.all.draw}/${team.all.lose}`).appendTo($(".row"+i));
        $("<td>").text(team.points).appendTo($(".row"+i));
        i++
    }
}

async function updatePoints() {
    let data = ({userID: localStorage.getItem("userID")})
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Pts: ${points[0].points}`);
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

getTeam()
updatePoints()

    