//List of modules and primitive types
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
//This is the URL data that needs gets passed around
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//This is the list of users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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
};

//Hello message on root page of TinyApp
app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});

//Render templateVars to be accessible within the urls index page
app.get("/urls", (req, res) => {
  //This returns the cookie id
  let user_id = req.cookies["user_id"];
  //This returns the user object based on user cookie
  let user = users[user_id];
  //console.log(user);
  let templateVars = { user: user, urls: urlDatabase};
  //"urls_index is actually a template of ejs"
  res.render("urls_index", templateVars);
});

//Renders the login page with templateVars containing user information
app.get("/login", (req, res) => {
  //This returns the cookie id
  let user_id = req.cookies["user_id"];
  //This returns the user object based on user cookie
  let user = users[user_id];
  //console.log(user);
  let templateVars = { user: user};
  //"urls_index is actually a template of ejs"
  res.render("tiny_login", templateVars);
});

//Handles posts from /login directory and checks if the user exists, if the password is correct.
//Also creates a user_id cookie once the user has successfully logged in.
app.post("/login", (req, res) => {
  //Check if users email & password exists
  let isUserExist = false;
  let passwordMatch = false;
  let userID = "";
  //
  for (let user in users) {
    if (users[user].email === req.body.email) {
      isUserExist = true;
    }
  };
  //Checks if password matches and updates userID to the users ID
  for (let user in users) {
    if (users[user].password === req.body.password) {
      passwordMatch = true;
      userID = users[user].id;
    }
  };

  if (passwordMatch && isUserExist) {
    //Return the users information as a cookie and redirects to root
    res.cookie("user_id", userID);
    res.redirect("/");
  } else {
    res.status(403).send("Please enter correct username and password");
  }
});

//Clear cookies one the user logs out and redirect back to urls page
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//Render templateVars to be accessible within the new urls page
app.get("/urls/new", (req, res) => {
    //This returns the cookie id
  let user_id = req.cookies["user_id"]
  //This returns the user object based on user cookie
  let user = users[user_id]
  let templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//Redirects user to short URL(6 digit alphanumeric code)
//page generated from function above
app.post("/urls", (req, res) => {
  let randomSixDig = generateRandomString();
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
  //This returns the cookie id
  let user_id = req.cookies["user_id"]
  //This returns the user object based on user cookie
  let user = users[user_id]
  let templateVars = { user: user, shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

//Redirects the user upon pushing the delete button
app.post("/urls/:id/delete", (req, res) => {
  //urlDatabase represents the object  and req.params.id
  //represents the shortURL.  Delete operator deletes the key.
  delete urlDatabase[req.params.id];
  //res.redirect just refreshes our page everytime we delete
  res.redirect("/urls");
});

//Redirects the user upon pushing the update button
app.post("/urls/:id", (req, res) => {
  //req.body.update references a "name" parameter inside of the
  //urls_show HTML body
  urlDatabase[req.params.id] = req.body.update
  res.redirect("/urls");
});

//Renders the registry page with items inside of template vars
app.get("/register", (req, res) => {
    //This returns the cookie id
  let user_id = req.cookies["user_id"]
  //This returns the user object based on user cookie
  let user = users[user_id]
  let templateVars = { user: user };
  res.render("tiny_register", templateVars);
});

//Process user input during registry process via post
app.post("/register", (req, res, err) => {
//Check if users email exists
let isUserExist = false;
for (let user in users) {
  if (users[user].email === req.body.email) {
    isUserExist = true;
  }
}
//Send 400 error "bad request" if email and password empty or user exists
//note the use of the "or" operator
if ((req.body.email === undefined && req.body.password === undefined) || isUserExist) {
  return res.sendStatus(400);
}
//Note that randomSixDig function is local to this "POST" request rather than global to the
//everything which would produce the same alphanumeric code
let randomSixDig = generateRandomString();
  users[randomSixDig] = {
    "id": randomSixDig,
    "email": req.body.email,
    "password": req.body.password
  };
  //debugger below
  //console.log(users[randomSixDig]);
  //Response with cookie containing the users id
  res.cookie("user_id", users[randomSixDig].id);
  //debugger below
  //console.log(users[randomSixDig]);
  res.redirect("/urls");
});

//Displays the urlDatabase object at the /urls.json directory
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