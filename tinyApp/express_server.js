var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
//This ist he URL data that needs to get passes to urls_index.ejs
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

var randomSixDig = generateRandomString();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase};
  //"urls_index is actually a template of ejs"
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  let userName = req.body.username;
  //console.log(userName);
  res.cookie("username", userName);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  let userName = req.body.username;
  //console.log(userName);
  res.clearCookie('username');
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  urlDatabase[randomSixDig] = req.body.longURL
  res.redirect("http://localhost:8080/urls/" + randomSixDig);
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params.shortURL);
  let longURL = urlDatabase[req.params.shortURL];
  //console.log(urlDatabase);
  res.redirect(longURL, 303);
});

app.get("/urls/:id", (req, res) => {
  console.log(req.cookies);
  //console.log(req.params)
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  //urlDatabase represents the object  and req.params.id
  //represents the shortURL.  Delete operator deletes the key.
  delete urlDatabase[req.params.id];
  //res.redirect just refreshes our page everytime we delete
  res.redirect("/urls", 302);
});

app.post("/urls/:id", (req, res) => {
  //req.body.update references a "name" parameter inside of the
  //urls_show HTML body
  urlDatabase[req.params.id] = req.body.update;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});