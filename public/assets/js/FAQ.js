async function updatePoints() {
    let data = ({userID: localStorage.getItem("userID")})
    let points = await $.ajax({
        method: "POST",
        url: "/getPoints",
        data: data
    });
    $("#points").text(`Pts: ${points[0].points}`);
};

async function verify() {
    let response =  await $.ajax({
        method: "POST",
        url: "/verification",
        data: {userID: localStorage.getItem("userID")}
    });
    if (response == "verified") {
        updatePoints();  
    }
    else {
        window.location.href = "/login.html";
    };
};

verify();