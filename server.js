const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();

app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});  

//End Points
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/main.html"));
});

app.get("/team", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/team.html"));
});

module.exports = function(app) {
    
};
