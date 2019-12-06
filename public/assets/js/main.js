
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

async function loadStandings() {
    settings.url = `https://api-football-v1.p.rapidapi.com/v2/leagueTable/524`;
    let standings = await $.get(settings);
    for ([index,team] of standings.api.standings[0].entries()){
        i = index + 1
        $("<tr>").addClass("standRow"+i).appendTo(".leagueBody");
        $("<th>").attr({
            scope: "row",
            class: "header"+i,
        }).text(i).appendTo(".standRow"+i)
        $("<td>").text(team.teamName).appendTo($(".standRow"+i));
        $("<td>").text(team.all.matchsPlayed).appendTo($(".standRow"+i));
        $("<td>").text(`${team.all.win}/${team.all.draw}/${team.all.lose}`).appendTo($(".standRow"+i));
        $("<td>").text(team.all.goalsFor).appendTo($(".standRow"+i));
        $("<td>").text(team.all.goalsAgainst).appendTo($(".standRow"+i));
        $("<td>").text(team.goalsDiff).appendTo($(".standRow"+i));
        $("<td>").text(team.points).appendTo($(".standRow"+i));
    };
};

async function loadFixtures(gameWeek) {
    $("<div>").addClass("spinner-border").attr("role","status").insertAfter(".fixturesTitle");
    $("<p>").text("Loading fixtures...").insertAfter(".fixturesTitle");
    settings.url = "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524";
    data = await $.get(settings);
    fixtures = data.api.fixtures;
    if (!isNaN(gameWeek)) {
        date_timestamp = gameWeek.toString();
        date_timestamp = date_timestamp.slice(0,-3);
        var futureFixtures = [];
        for (fixture of fixtures) {
            if (fixture.event_timestamp > date_timestamp) {futureFixtures.push(fixture)};
        }
        gameWeek = futureFixtures[0].round;
    };

    var weekFixtures = [];
    for (fixture of fixtures) {
        if (fixture.round == gameWeek) {weekFixtures.push(fixture)};
    };

    let userID = ({userID: localStorage.getItem("userID")})
    let betHistory = await $.post({
        url: "/bets",
        method: "POST",
        data: userID
    });

    apiCalls = weekFixtures.map(fixture =>
        //remove entire settings object, just need fixtureID passed in
        settings = {
            "async": true,
            "crossDomain": true,
            "url": `https://api-football-v1.p.rapidapi.com/v2/odds/fixture/${fixture.fixture_id}`,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
            }
        }
    );

    let allFixtureOdds = await Promise.all(apiCalls.map(url =>
        $.get(url)
    ));

    $(".fixtures").siblings().remove();
    $("<h6>").text("Game Week " + gameWeek.replace(/[^0-9]/g,'')).appendTo(".fixtures");

    for ([index, fixture] of weekFixtures.entries()) {
        i = index+1
        //odds
        try {
            for (odds of allFixtureOdds) {
                if (odds.api.odds[0].fixture.fixture_id == fixture.fixture_id) 
                {fixtureOdds = odds.api.odds[0].bookmakers[0].bets[0].values};
            };
        }
        catch {
            //Solution when odds not received from API
            fixtureOdds[0].odd = 2.55
            fixtureOdds[1].odd = 5.10
            fixtureOdds[2].odd = 1.20
        };

        $("<div>").addClass("fixRow"+i).addClass("container").appendTo(".fixtures")
        
        var betPlaced
        if (fixture.status == "Not Started") {
            $("<p>").addClass("card-text").text(`${fixture.event_date.substring(0,10)}`).appendTo(".fixRow"+i)
            $("<p>").attr({
                class: "fixture"+i,
                fixtureID: fixture.fixture_id,
                homeTeam: fixture.homeTeam.team_name,
                awayTeam: fixture.awayTeam.team_name,
                odds: 2,
                class: "card-text"
            }).text(`${fixture.homeTeam.team_name} (H) vs. ${fixture.awayTeam.team_name} (A)`).appendTo(".fixRow"+i)
            betPlaced = false;
            for (bet of betHistory) {
                if (fixture.fixture_id == bet.fixture_id) {
                    betInfo = bet;
                    betPlaced = true;
                };
            };
            //Betting input and buttons (show if not bet yet)
            if (betPlaced == false) {
                $("<input>").attr({
                    class: "form-control form-control-sm my-1",
                    class: "placeBet"+i,
                    type: "text",
                    placeholder: "Bet Amount",
                    style: "width: 40%; border-radius: 5px;"
                }).appendTo(".fixRow"+i);
                for ([a, bet] of ["Home", "Away", "Draw"].entries()){
                    $("<button>").attr({
                        class: "btn btn-outline-dark btn-sm betButton",
                        class: bet+i,
                        type: "button",
                        style: "font-size: x-small; margin: 1%"
                    }).text(`${bet}: ${fixtureOdds[a].odd}`).appendTo(".fixRow"+i);
                };
            }
            else {
                //show bet, if placed
                $("<span>").css("color","green").text(betInfo.amountPlaced).appendTo(".fixRow"+i);
                $("<span>").text("points for").appendTo(".fixRow"+i);
                $("<span>").css("color","green").text(betInfo.team).appendTo(".fixRow"+i)
            };
        }
        else {
            if (fixture.status == "Match Finished") {
                $("<div>").addClass("card-text").text(`Match Finished`).appendTo(".fixRow"+i);
            }
            else {
                $("<div>").addClass("card-text").addClass("status"+i).text(`Match Live`).appendTo(".fixRow"+i);
                $("<div>").addClass("spinner-grow spinner-grow-sm text-success").attr("role","status").appendTo(".status"+i);                
            };
            $("<div>").addClass("card-text").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name}`).appendTo(".fixRow"+i);
            $("<div>").addClass("card-text").text(`${fixture.goalsHomeTeam} - ${fixture.goalsAwayTeam}`).appendTo(".fixRow"+i);
            if (betPlaced == true) {
                $("<div>").text(`${betInfo.amountPlaced} points for ${betInfo.team}`).appendTo(".fixRow"+i);
                $("<div>").text(` points for `).appendTo(".fixRow"+i);
                $("<div>").text(`${betInfo.team}`).appendTo(".fixRow"+i);
            };
        };
    };
    $(".betButton").on("click", placeBet);
};

async function loadCompany() {
    let companyID = ({companyID: localStorage.getItem("companyID")});
    if (companyID.companyID !== null) {
        let company = await $.ajax({
            method: "POST",
            url: "/group",
            data: companyID
        });
        $(".companySelect").attr("style","display: none")
        $(".companyDisplay").attr("style","display: block")
        for ([index,user] of company.entries()) {
            i = index + 1
            $("<tr>").addClass("row"+i).appendTo(".companyTable")
            $("<th>").attr("scope","row").text(i).appendTo(".row"+i)
            $("<td>").text(user.username).appendTo(".row"+i)
            $("<td>").text(user.points).appendTo(".row"+i)
        };
    };
};

async function placeBet() {
    number = this.id.replace(/[^0-9]/g,'')
    if ($(".placeBet" + number).val() < 5) {
        $(".funds"+number).remove()
        $("<div>").addClass("funds"+number).text(`Bet minimum of 5 points.`).appendTo(".fixture"+number)
    }
    else {
        fixture = $(".fixture" + number);
        var bet = {}
        bet.fixtureID = fixture.attr("fixtureid");
        bet.fixture = `${fixture.attr("hometeam")} vs. ${fixture.attr("awayteam")}`;
        bet.date = fixture.siblings().text()
        team = $(this).text().substring(0,4)
        switch(team) {
            case "Home": bet.team = fixture.attr("hometeam");
            break;
            case "Away": bet.team = fixture.attr("awayteam");
            break;
            case "Draw": bet.team = "Draw";
            break;
            default: console.log("default");
        };
        bet.amount = $(".placeBet" + number).val();
        bet.odds = `${$(this).text().replace(/[^0-9]/g,'').slice(0,1)}.${$(this).text().replace(/[^0-9]/g,'').slice(1,3)}`
        bet.userID = localStorage.getItem("userID");
        status = await $.ajax({
            method: "POST",
            url: "/placeBet",
            data: bet
        });
        if (status == "placed") {
            $(".funds"+number).remove()
            $(`.placeBet${number}, .homeBet${number}, .visitorBet${number}, .draw${number}`).hide()
            $("<div>").text(`${bet.amount} points for ${bet.team}`).appendTo(".fixture"+number)
            updatePoints()
        }
        else if (status == "no funds") {
            $(".funds"+number).remove()
            $("<div>").addClass("funds"+number).text(`Insufficient points to place bet`).appendTo(".fixture"+number)
        };
    };
};

async function updatePoints() {
    let data = ({userID: localStorage.getItem("userID")})
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Pts: ${points[0].points}`);
};

async function pointDeductions() {
    var pointPenalty = localStorage.getItem("deductions");
    console.log(pointPenalty);
    if (pointPenalty !== null) {
        console.log("penalizing")
        localStorage.removeItem("deductions");
        $("#myModal").modal("toggle");
        $("#modalTitle").text("Point penalties");
        $("#modalMessage").text(`Due to your recent inactivity, you have been deducted ${pointPenalty} points as a penalty.`);
        var userInfo = {userID: localStorage.getItem("userID")};
        $.ajax({
            method: "POST",
            url: "/pointpenalty",
            data: userInfo
        });
        console.log("finished")
    };
};

async function loadColleagueHistory() {
    
    let userData = {userID: localStorage.getItem("userID"), companyID: localStorage.getItem("companyID")};
    let betHistory = await $.ajax({
        method: "POST",
        url: "/betHistory",
        data: userData
    });
    $("#company").text(` ${betHistory.companyName}`);
    $("#username").text(` ${betHistory.userName}`);
    
    for ([index,bet] of betHistory.userBets.entries()) {
        i = index + 1;
        $("<tr>").attr("id","row"+i).appendTo("#betTable");
        if (bet.score !== null) {score = ` (${bet.score})`}
        else {score = ""};
        $("<td>").text(`${bet.fixture}${score}`).appendTo("#row"+i);
        $("<td>").text(bet.fixture_date).appendTo("#row"+i);
        $("<td>").text(bet.team).appendTo("#row"+i);
        $("<td>").text(bet.amountPlaced).appendTo("#row"+i);
        $("<td>").text(bet.odds).appendTo("#row"+i);
        if (bet.amountwon > 0) {colour = "green"}
        else {colour = "red"};
        $("<td>").text(bet.amountwon).css("color",colour).appendTo("#row"+i);
    };
};

async function mainLoad() {
    pointDeductions();
    updatePoints();
    loadStandings();
    loadCompany();
    loadFixtures(Date.now());
};

mainLoad();


$("#searchSubmit").click( function() {
    window.location.href = "/team.html";
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$(".createCompanyGroup").click( async function() {
    data = $(".nameCompanyGroup").val()
    data = ({groupName: data})
    response = await $.ajax({
        url: "/createGroup",
        data: data,
        method: "POST"
    })
    if (response == "") {
        $("<p>").addClass("exists").text("Company already exists. Choose another name.").appendTo(".companySelect")
    }
    else {
        loadCompany();
        updatePoints();
    };
});

$(".joinCompanyGroup").click( async function() {
    event.preventDefault();
    data = $(".joinGroup").val();
    data = ({groupName: data});
    let groupSearch = await $.ajax({
        url: "/searchGroup",
        data: data,
        method: "POST"
    });
    for ([index,group] of groupSearch.entries()) {
        i = index + 1;
        $("<tr>").attr({
            class: "searchRow"+i,
            class: "result"
        }).appendTo(".searchTable")
        $("<td>").addClass("result").text(group.name).appendTo(".searchRow"+i)
    };
    $(".result").on("click", async function() {
        data = this.id.replace(/[^0-9]/g,'');
        data = ({companyID: data});
        let company = await $.ajax({
            url: "/joinGroup",
            data: data,
            method: "POST"
        });
        localStorage.setItem("companyID", data.companyID)
        $(".result").remove();
        loadCompany();
        updatePoints();
    });
});

// $(".joinCompanyGroup").on("click", joinCompanyGroup);
// $(".createCompanyGroup").on("click", createCompanyGroup);

$("#signOut").click(function() {
    localStorage.removeItem("companyID");
    localStorage.removeItem("userID");
    $.post("/signout");
});