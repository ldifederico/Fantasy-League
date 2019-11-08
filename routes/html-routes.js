var path = require("path");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//End Points
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/main.html"));
});

app.get("/team", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/team.html"));
});

module.exports = function(app) {

};
