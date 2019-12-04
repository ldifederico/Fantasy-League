var path = require("path");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

settings.url = `https://api-football-v1.p.rapidapi.com/v2/teams/search/${teamName}`
data = await $.get(settings)
let teamData = data.api.teams[0]
