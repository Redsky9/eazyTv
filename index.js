var express = require("express");
var bP = require("body-parser");
var request = require("request");
var fetch = require("node-fetch");
var rp = require("request-promise");
var moment = require("moment");
var fs = require("fs");
var app = express();
var PORT = process.env.PORT || 5000;
var keys = require("./config/keys.json");
var utils = require("./config/utils.json");
var all = "";

app.set("view engine", "ejs");
app.use(bP.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("config"));

var options = { method: 'GET',
  url: 'https://api.themoviedb.org/3/authentication/token/new?api_key=' + keys.apiKey,
  qs: { api_key: keys.api_key },
  body: '{}' };

app.get("/", (req, res) => {
    console.log("sasasasasasas");
    if(keys.requestToken === "" || keys.expires_at === ""){
        console.log("Getting Request Token.");
        getToken(res);
    }else if(getTimeRemaining() <= 1){
        console.log("Token is expired. Getting a new one.");
        getToken(res);
    }else{
        res.redirect("/index");
    }
});

app.get("/index", (req, res) => {
    if(keys.session_id === ""){
        createSession(res);
    }
    res.render("index.ejs", {data: null});
});

app.post("/index", (req, res) => {
    var searchItem = req.body.movieTitle;
    console.log(searchItem);
    getItemId(res, searchItem);
});

app.listen(PORT, process.env.IP, () => {
    console.log("Server started on port " + PORT);
});

// METHODS

function getToken(response){
    fetch(options.url).then(function(res){
        return res.json();
    }).then(function(json){
        writeKeys(json);
        askPermission(response);
    });
}

function askPermission(response){
    console.log(keys.requestToken);
    response.redirect("https://www.themoviedb.org/authenticate/" + keys.requestToken + "?redirect_to=http://localhost:5000/index");
}

function createSession(response){
    var url = "https://api.themoviedb.org/3/authentication/session/new?api_key=" + keys.apiKey + "&request_token=" + keys.requestToken;
    request(url, (err, data) => {
        var final = JSON.parse(data.body);
        keys.sessionId = final.session_id;
        fs.writeFile("./config/keys.json", JSON.stringify(keys, undefined, '\t'), (err) => {
            if (err) throw new Error(err);
            console.log("Keys.json updated successfully.");
        });
    });
}

function writeKeys(data){
    keys.requestToken = data.request_token; 
    keys.expires_at = data.expires_at;
    fs.writeFile("./config/keys.json", JSON.stringify(keys, undefined, '\t'), (err) => {
        if (err) throw new Error(err);
        console.log("Keys.json updated successfully.");
    });
}

function getTimeRemaining(){
    var now = new Date();
    var then = new Date(keys.expires_at);
    var timeDiff = moment.utc(moment(then, "DD/MM/YYY HH:mm:ss").diff(moment(now, "DD/MM/YYY HH:mm:ss"))).format("HH:mm");
    var totalTime = (parseInt(timeDiff.substring(0, 2) * 60) + parseInt(timeDiff.substring(3, 5)));

    return totalTime;
}

function getItemId(response, name){
    var url = ("https://api.themoviedb.org/3/search/tv?api_key=" + keys.apiKey + "&language=en-US&query=" + name);
    var data;
    console.log(url);
    fetch(url).then((res) => {
        return res.json();
    }).then((body) => {
        // console.log(body);
        if(body !== null){
            // console.log(body.results.length);
            getItemData(response, body.results[0].id);
        }
    });
}

function getItemData(response, id){
    var url = ("https://api.themoviedb.org/3/tv/" + id + "?api_key=" + keys.apiKey + "&language=en-US");
    fetch(url).then((res) => {
        return res.json();
    }).then((body) => {
        var data = {
            "title": body.name,
            "id": body.id,
            "imgUrl": utils.imgUrl + body.poster_path
        }
        response.render("index.ejs", {data: data});
    });
}