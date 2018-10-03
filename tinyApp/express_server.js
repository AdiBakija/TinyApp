//List of modules and primitive types
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
//This ist he URL data that needs to get passes to urls_index.ejs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//List used apps
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//Set view engine to EJS so EJS knows where to look
app.set("view engine", "ejs");
//Function to generate a random 6 digit alphanumeric string
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

var randomSixDig = generateRandomString();
//Hello message on root page of TinyApp
app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});
//Render templateVars to be accessible within the urls index page
app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase};
  //"urls_index is actually a template of ejs"
  res.render("urls_index", templateVars);
});
//Store cookies for the logins provided username and redirect "refresh"
//to urls page
app.post("/login", (req, res) => {
  let userName = req.body.username;
  res.cookie("username", userName);
  res.redirect("/urls");
});
//Clear cookies one the user logs out and redirect back to urls page
app.post("/logout", (req, res) => {
  let userName = req.body.username;
  res.clearCookie('username');
  res.redirect("/urls");
});
//Render templateVars to be accessible within the new urls page
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});
//Redirects user to short URL(6 digit alphanumeric code)
//page generated from function above
app.post("/urls", (req, res) => {
  urlDatabase[randomSixDig] = req.body.longURL
  res.redirect("http://localhost:8080/urls/" + randomSixDig);
});
//Redirects user to the webpage they shortened the link to
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//Render template vars to be accessible within the urls show page
app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});
//Redirects the user upon pushing the delete button
app.post("/urls/:id/delete", (req, res) => {
  //urlDatabase represents the object  and req.params.id
  //represents the shortURL.  Delete operator deletes the key.
  delete urlDatabase[req.params.id];
  //res.redirect just refreshes our page everytime we delete
  res.redirect("/urls", 302);
});
//Redirects the user upon pushing the update button
app.post("/urls/:id", (req, res) => {
  //req.body.update references a "name" parameter inside of the
  //urls_show HTML body
  urlDatabase[req.params.id] = req.body.update;
  res.redirect("/urls");
});
//Not really sure what this step does?
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//A test to see the servers functionality
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//Listens on port 8080 and logs statement to confirm
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});