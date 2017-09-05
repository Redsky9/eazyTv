var express = require("express");
var bP = require("body-parser");
var request = require("request");
var app = express();
var PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.use(bP.urlencoded({extended: true}));
app.use(express.static("public"));

var options = {
    "api_key": "44c0812cc2ccd8443ae1c174b8f35492",
    "hostname": "api.themoviedb.org",
    "port": null,
    "path": "/3/find/friends?external_source=tvrage_id&language=en-US&api_key=",
    "headers": {}
  };


app.get("/", (req, res) => {
    res.render("index.ejs");
    request("https://api.themoviedb.org/3/search/tv?api_key=&language=en-US&query=stranger&page=1", function (error, response, body) {
        if (error) throw new Error(error);
    
        console.log(body);
    });
});

app.post("/", (req, res) => {
    console.log(req.body);
});

app.listen(PORT, process.env.IP, () => {
    console.log("Server started on port " + PORT);
});
