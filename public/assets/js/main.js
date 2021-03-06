var quota
var settings = {
	"async": true,
	"crossDomain": true,
	"url": "",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		"x-rapidapi-key": "f01f638c42msh4d70f52d10f6b45p1a4b54jsnc4117f6c2a19"
    },
    "success": function(data, status, xhr) {
        quota = xhr.getResponseHeader('x-ratelimit-requests-remaining');
    }
};


async function APIRequest(url) {
    //Check if Football API has request remaining in daily quota
    currentQuota = await $.post("/quotaCheck");
    if (currentQuota > 0) {
        //Database confirms there are API requests remaining in today's quota. Executing API request
        settings.url = url;
        APIResult = await $.get(settings);
        //Sending server updated quota information
        await $.ajax({
            method: "POST",
            url: "/updateQuota",
            data: {"quota": quota}
        });
        return APIResult;
    }
    else if (currentQuota == 0) {
        return "Quota used";
    };
}

async function loadStandings() {
    let standingsData = await $.get("/getStoredStandings")
    console.log(standingsData)


    // let standings = await $.get("/getStoredStandings")

    //Storing latest standings in database (in case API is down)
    
    // if (APIdata == "Quota used") {
    //     standings = $.get("/getStoredStandings")
    // }
    // else {

    // };

    try {
        for ([index,team] of standingsData.entries()){
            console.log()
            i = index + 1
            $("<tr>").addClass("standRow"+i).appendTo(".leagueBody");
            $("<th>").attr({
                scope: "row",
                class: "header"+i,
            }).text(i).appendTo(".standRow"+i)
            $("<td>").text(team.club).appendTo($(".standRow"+i));
            $("<td>").text(team.played).appendTo($(".standRow"+i));
            $("<td>").text(`${team.win}/${team.draw}/${team.loss}`).appendTo($(".standRow"+i));
            $("<td>").text(team.gf).appendTo($(".standRow"+i));
            $("<td>").text(team.ga).appendTo($(".standRow"+i));
            $("<td>").text(team.gd).appendTo($(".standRow"+i));
            $("<td>").text(team.points).appendTo($(".standRow"+i));
        };
    }
    catch {
        $("[flag=loadingStatus]").remove();
        $("<img>").attr("src", "/assets/media/exhausted.png").css({"height": "50px", "width": "50px", "margin-left": "auto", "margin-right": "auto"}).insertAfter(".epl");
        $("<p>").text("Unable to load league standings.").insertAfter(".epl");
        // $("<img>").attr("src", "/assets/media/exhausted.png").css({"height": "50px", "width": "50px", "margin-left": "auto", "margin-right": "auto"}).insertAfter(".fixturesTitle");
        // $("<p>").text("Unable to load league standings.").insertAfter(".fixturesTitle");
    };
};

async function loadFixtures(gameWeek) {
    $("<div>").addClass("spinner-border").attr({
        role: "status",
        flag: "loadingStatus"
    }).insertAfter(".fixturesTitle");
    $("<p>").attr("flag","loadingStatus").text("Loading fixtures...").insertAfter(".fixturesTitle");
    let fixtureData = await APIRequest("https://api-football-v1.p.rapidapi.com/v2/fixtures/league/524")
    fixtures = fixtureData.api.fixtures;
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

    //Load any active user bets from DB
    let userID = ({userID: localStorage.getItem("userID")})
    let betHistory = await $.post({
        url: "/bets",
        data: userID
    });

    //Load odds from DB and define standard odds when there is a lapse in API data
    let oddsData = await $.post({
        url: "/loadOdds",
        data: {"fixtures" : weekFixtures}
    });
    var standardOdds = [2.55, 5.10, 1.20]
    
        $("[flag=loadingStatus]").remove();
        $("<h6>").text("Game Week " + gameWeek.replace(/[^0-9]/g,'')).appendTo(".fixtures");

        for ([index, fixture] of weekFixtures.entries()) {
            i = index + 1;

            $("<div>").addClass(`fixRow${i}`).addClass("container").appendTo(".fixtures")
            
            //Displaying fixtures and odds on screen
            var betPlaced
            if (fixture.status == "Not Started") {
                //Display fixture
                $("<p>").addClass("card-text").text(`${fixture.event_date.substring(0,10)}`).appendTo(".fixRow"+i)
                $("<p>").attr({
                    class: `fixture${i} card-text`,
                    fixtureID: fixture.fixture_id,
                    homeTeam: fixture.homeTeam.team_name,
                    awayTeam: fixture.awayTeam.team_name,
                    odds: 2,
                    date: fixture.event_date.substring(0,10),
                    gameWeek: fixture.round.replace(/[^0-9]/g,'')
                }).text(`${fixture.homeTeam.team_name} (H) vs. ${fixture.awayTeam.team_name} (A)`).appendTo(".fixRow"+i).css("font-weight", "900")
                betPlaced = false;
                for (bet of betHistory) {
                    if (fixture.fixture_id == bet.fixture_id) {
                        betInfo = bet;
                        betPlaced = true;
                    };
                };
                //Betting input and buttons (show if not bet yet)
                if (betPlaced == false) {
                    //Show odds from database. Try Catch because API does not provide full odds data sometimes
                    $("<input>").attr({
                        class: `form-control form-control-sm my-1 placeBet${i}`,
                        type: "text",
                        placeholder: "Bet Amount",
                        style: "width: 100px; border-radius: 5px; margin-left: auto; margin-right: auto"
                    }).appendTo(".fixRow"+i);
                    try {
                        for ([a, bet] of ["Home", "Draw", "Away"].entries()){
                            $("<button>").attr({
                                class: `btn btn-outline-dark btn-sm betButton ${bet + i}`,
                                betID: i,
                                type: "button",
                                style: "font-size: x-small; margin: 1%; background: #333a40; color: white"
                            }).text(`${bet}: ${(Math.round(oddsData[index][0][bet.toLowerCase()] * 100) / 100).toFixed(2)}`).appendTo(".fixRow"+i);
                        };
                    }
                    catch {
                        //Issues with API odds, using standard odds array defined above
                        for ([a, bet] of ["Home", "Draw", "Away"].entries()){
                            $("<button>").attr({
                                class: `btn btn-outline-dark btn-sm betButton ${bet + i}`,
                                betID: i,
                                type: "button",
                                style: "font-size: x-small; margin: 1%; background: #333a40; color: white"
                            }).text(`${bet}: ${(Math.round(standardOdds[a] * 100) / 100).toFixed(2)}`).appendTo(".fixRow"+i);
                        };
                    }
                }
                else {
                    //User has placed a bet, so show this instead of odds
                    $("<span>").addClass("rounded-circle").css({"color": "brown", "font-weight": "1000"}).text(betInfo.amountPlaced).appendTo(".fixRow"+i);
                    $("<span>").text("points for").appendTo(".fixRow"+i);
                    $("<span>").addClass("rounded-circle").css({"color": "brown", "font-weight": "1000"}).text(betInfo.team).appendTo(".fixRow"+i);
                };
            }
            else {
                //Match Live or Finished
                if (fixture.status == "Match Finished") {
                    //match finished, display match finished
                    $("<div>").addClass("card-text").text(`Match Finished`).appendTo(".fixRow"+i);
                }
                else {
                    //match live, show Match Live and green spinner
                    $("<div>").addClass("card-text").addClass("status"+i).text(`Match Live`).appendTo(".fixRow"+i);
                    $("<div>").addClass("spinner-grow spinner-grow-sm text-success").attr("role","status").appendTo(".status"+i);                
                };
                $("<div>").addClass("card-text").text(`${fixture.homeTeam.team_name} vs. ${fixture.awayTeam.team_name}`).appendTo(".fixRow"+i).css("font-weight", "900");
                $("<div>").addClass("card-text").text(`${fixture.goalsHomeTeam} - ${fixture.goalsAwayTeam}`).appendTo(".fixRow"+i);
                if (betPlaced == true) {
                    $("<span>").css({"color": "brown", "font-weight": "1000"}).text(betInfo.amountPlaced).appendTo(".fixRow"+i);
                    $("<span>").text("points for").appendTo(".fixRow"+i);
                    $("<span>").css({"color": "brown", "font-weight": "1000"}).text(betInfo.team).appendTo(".fixRow"+i);
                };
            };
        };
        $(".betButton").on("click", placeBet);

    //SERVER ISSUES NOTIFICATION if needed
    //     $("[flag=loadingStatus]").remove();
    //     $("<img>").attr("src", "/assets/media/exhausted.png").css({"height": "50px", "width": "50px", "margin-left": "auto", "margin-right": "auto"}).insertAfter(".fixturesTitle");
    //     $("<p>").text("Server busy. Please try again in a few minutes.").insertAfter(".fixturesTitle");

};

async function loadCompany() {
    let companyID = {companyID: localStorage.getItem("companyID"), userID: localStorage.getItem("userID")};
    if (companyID.companyID !== null) {
        let company = await $.ajax({
            method: "POST",
            url: "/group",
            data: companyID
        });
        $(".companySelect").attr("style", "display: none");
        $(".companyDisplay").attr("style", "display: block");
        for ([index, user] of company.group.entries()) {
            i = index + 1;
            if (user.username == company.username[0].username) {
                $("<tr>").addClass(`row${i} useritem`).attr("username", user.username).css({"color": "white", "background-color": "#333a40"}).appendTo(".companyTable");
            } 
            else {
                $("<tr>").addClass(`row${i} useritem`).attr("username", user.username).appendTo(".companyTable");
            }
            $("<th>").attr("scope","row").text(i).appendTo(".row"+i);
            $("<td>").text(user.username).appendTo(".row"+i);
            $("<td>").text(user.points).appendTo(".row"+i);
        };
        $(".useritem").click(loadUserProfile);
    };
};

async function loadUserProfile() {
    document.cookie = "userSearch= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `userSearch=${$(this).attr("username")}`;
    window.location.href = "/colleagueHistory.html";
}

async function placeBet() {
    number = $(this).attr("betID");
    if ($(`.placeBet${number}`)[0].value !== "") {
        betAmount = $(`.placeBet${number}`)[0].value
    }
    else {
        betAmount = $(`.placeBet${number}`)[1].value
    };
    if (betAmount < 5) {
        $(".funds"+number).remove();
        $("<div>").addClass("funds"+number).text(`Bet minimum of 5 points.`).css("color","red").appendTo(".fixture"+number);
    }
    else {
        fixture = $(".fixture" + number);
        var bet = {};
        bet.fixtureID = fixture.attr("fixtureid");
        bet.fixture = `${fixture.attr("hometeam")} vs. ${fixture.attr("awayteam")}`;
        bet.date = fixture.attr("date");
        team = $(this).text().substring(0,4);
        switch(team) {
            case "Home": bet.team = fixture.attr("hometeam");
            break;
            case "Away": bet.team = fixture.attr("awayteam");
            break;
            case "Draw": bet.team = "Draw";
            break;
            default: console.log("default");
        };
        bet.amount = betAmount;
        bet.odds = `${$(this).text().replace(/[^0-9]/g,'').slice(0,1)}.${$(this).text().replace(/[^0-9]/g,'').slice(1,3)}`;
        bet.userID = localStorage.getItem("userID");
        bet.gameWeek = fixture.attr("gameweek");
        let status = await $.ajax({ 
            method: "POST",
            url: "/placeBet",
            data: bet
        });
        if (status == "placed") {
            $(".funds"+number).remove();
            $(`.placeBet${number}`).hide()
            $(`.placeBet${number}, .Home${number}, .Away${number}, .Draw${number}`).hide();
            $("<span>").addClass("rounded-circle").css({"color": "brown", "font-weight": "1000"}).text(bet.amount).appendTo(".fixRow"+number);
            $("<span>").text("points for").appendTo(".fixRow"+number);
            $("<span>").css({"color": "brown", "font-weight": "1000"}).text(bet.team).appendTo(".fixRow"+number);
            updatePoints();
        }
        else if (status == "no funds") {
            $(".funds"+number).remove();
            $("<div>").addClass("funds"+number).text(`Insufficient points to place bet`).css("color","red").appendTo(".fixture"+number);
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
    if (pointPenalty !== null) {
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
    };
};

async function searchCompany() {
    if ($(".joinGroup")[0].value !== "") {
        groupName = $(".joinGroup")[0].value
    }
    else {
        groupName = $(".joinGroup")[1].value
    };
    data = {groupName: groupName};
    let groupSearch = await $.ajax({
        url: "/searchGroup",
        data: data,
        method: "POST"
    });
    $(".searchTable").empty();
    for ([index,group] of groupSearch.entries()) {
        i = index + 1;
        $("<tr>").addClass(`searchRow${i} result`).attr({
            companyID: group.id,
            companyName: group.name
        }).appendTo(".searchTable");
        $("<td>").text(group.name).appendTo(".searchRow"+i);
    };
    $(".result").on("click", async function() {
        data = {userID: localStorage.getItem("userID"), companyID: $(this).attr("companyID")};
        let response = await $.ajax({
            url: "/joinGroup",
            data: data,
            method: "POST"
        });
        $(".companyText2").remove();
        localStorage.setItem("companyID", data.companyID);
        $(".result").remove();
        loadCompany();
        updatePoints();
        $("#myModal").modal("toggle");
        $("#modalTitle").text(`Successfully joined ${$(this).attr("companyName")}`);
        $("#modalMessage").text(`You haved joined ${$(this).attr("companyName")} and have ${response.points} points. Use them wisely!`);
    });
};

async function createCompany() {
    if ($(".nameCompanyGroup")[0].value !== "") {
        groupName = $(".nameCompanyGroup")[0].value
    }
    else {
        groupName = $(".nameCompanyGroup")[1].value
    };
    data = ({groupName: groupName, userID: localStorage.getItem("userID")});
    response = await $.ajax({
        url: "/createGroup",
        data: data,
        method: "POST"
    });
    if (response == "") {
        $(".exists").remove();
        $("<p>").addClass("exists").text("Company already exists. Choose another name.").appendTo(".companySelect");
    }
    else {
        $(".companyText2").remove();
        localStorage.setItem("companyID", response.companyID);
        loadCompany();
        updatePoints();
        $("#myModal").modal("toggle");
        $("#modalTitle").text(`Successfully created ${response.companyName}`);
        $("#modalMessage").text(`You haved created and joined ${response.companyName} and have ${response.points} points. Spend them wisely!`);
    };
};

async function mainLoad() {
    pointDeductions();
    updatePoints();
    loadStandings();
    loadCompany();
    loadFixtures(Date.now());
};

async function verify() {
    let response =  await $.ajax({
        method: "POST",
        url: "/verification",
        data: {userID: localStorage.getItem("userID")}
    });
    if (response == "verified") {
        mainLoad();  
    }
    else {
        window.location.href = "/login.html";
    };
};

verify();


$("#searchSubmit").click( function() {
    window.location.href = "/team.html";
    event.preventDefault();
    document.cookie = "teamName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `teamName=${$("#teamName").val()}`;
});

$(".createCompanyGroup").click( async function() {
    $(".companyText1").hide();
    $(".companyText2").text("Enter your company name and click create");
    $(".joinCompanyGroup").hide();
    $(".nameCompanyGroup").show();
    $(".createCompanyGroup").unbind("click");
    $(".createCompanyGroup").click(createCompany);
});

$(".joinCompanyGroup").click( async function() {
    $(".companyText1").hide();
    $(".companyText2").text("Enter your company name and click it to join.");
    $(".createCompanyGroup").hide();
    $(".joinCompanyGroup").hide();
    $(".searchCompanyGroup").show();
    $(".joinGroup").show()
    $(".searchCompanyGroup").click(searchCompany)
});

$("#signOut").click(function() {
    localStorage.removeItem("companyID");
    localStorage.removeItem("userID");
    $.post("/signout");
});