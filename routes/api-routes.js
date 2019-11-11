var path = require("path");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
