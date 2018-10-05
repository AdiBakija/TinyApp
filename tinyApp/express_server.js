//List of modules and primitive types
const cookieSession = require('cookie-session')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
//This is the URL data that needs gets passed around
const urlDatabase = {
  "b2xVn2": {
    URL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    URL:"http://www.google.com",
    userID: "user2RandomID"
  }
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

//List used apps (middleware)
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'TinyApp Session',
  keys: ["This is the secret phrase used for TinyApp"]
}));
//app.use(cookieParser());
//Set view engine to EJS so EJS knows where to look
app.set("view engine", "ejs");

//Helper function to generate a random 6 digit alphanumeric string
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
};

//Helper function to return filtered database for each user
function urlsForUser(id) {
  var filteredUrlDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredUrlDatabase[key] = urlDatabase[key]
    }
  }
  return filteredUrlDatabase;
};

//Hello message on root page of TinyApp
app.get("/", (req, res) => {
  res.send("Welcome to TinyApp!");
});

//Render templateVars to be accessible within the urls index page
app.get("/urls", (req, res) => {
  //This returns the cookie id
  let user_id = req.session["user_id"];
  //This returns the user object based on user cookie
  let user = users[user_id];
  //console.log(user);
  let templateVars = { user: user, urls: urlsForUser(user_id)};
  //"urls_index is actually a template of ejs"
  res.render("urls_index", templateVars);
});

//Renders the login page with templateVars containing user information
app.get("/login", (req, res) => {
  //This returns the cookie id
  let user_id = req.session["user_id"];
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
  let passwordEntered = req.body.password;
  let passwordMatch = false;
  let userID = "";
  //
  for (let user in users) {
    if (users[user].email === req.body.email) {
      isUserExist = true;
      //Note the order of comparison, the hashed password comes second!!!
      if (bcrypt.compareSync(passwordEntered, users[user].password)) {
        passwordMatch = true;
        userID = users[user].id;
      }
      break;
    }
  };

  if (passwordMatch && isUserExist) {
    //Return the users information as a cookie and redirects to root
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.status(403).send("Please enter correct username and password");
  }
  console.log(users);
});

//Clear cookies one the user logs out and redirect back to urls page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Render templateVars to be accessible within the new urls page
app.get("/urls/new", (req, res) => {
    //This returns the cookie id
  let user_id = req.session["user_id"];
  //This returns the user object based on user cookie
  let user = users[user_id]
  let templateVars = { user: user };
  if (user_id == undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Redirects user to short URL(6 digit alphanumeric code)
//page generated from function above
app.post("/urls", (req, res) => {
  let randomSixDig = generateRandomString();
  let userID = req.session["user_id"];
  urlDatabase[randomSixDig] = {
    URL: req.body.longURL,
    userID: userID
  };
  res.redirect("/urls/" + randomSixDig);
});

//Redirects user to the webpage they shortened the link to
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].URL;
  res.redirect(longURL);
});

//Render template vars to be accessible within the urls show page for logged in user
app.get("/urls/:id", (req, res) => {
  //This returns the cookie id
  let user_id = req.session["user_id"];
  //This returns the user object based on user cookie
  let URLUser = urlDatabase[req.params.id].userID
  let templateVars = { user: users[user_id], shortURL: req.params.id, longURL: urlDatabase[req.params.id].URL};
  if (user_id === undefined) {
    res.status(403).send("Please login to view this page");
  } else if (user_id != URLUser) {
    res.status(403).send("Only the original owner may view this content")
  } else {
    res.render("urls_show", templateVars);
  }
});

//Redirects the user upon pushing the delete button (only accessible to logged in users)
app.post("/urls/:id/delete", (req, res) => {
  //This returns the cookie id
  let user_id = req.session["user_id"];
  //This returns the user object based on user cookie
  let user = users[user_id].id
  let URLUser = urlDatabase[req.params.id].userID
    if (user === URLUser) {
      //urlDatabase represents the object  and req.params.id
      //represents the shortURL.  Delete operator deletes the key.
      delete urlDatabase[req.params.id];
      //res.redirect just refreshes our page everytime we delete
      res.redirect("/urls");
    } else {
      res.status(403).send("You may not delete that URL, please log in as the original poster.");
    }
});

//Redirects the user upon pushing the update button
app.post("/urls/:id", (req, res) => {
  //This returns the cookie id
  let user_id = req.session["user_id"];
  //This returns the user object based on user cookie
  let user = users[user_id].id
  //req.body.update references a "name" parameter inside of the
  //urls_show HTML body
  let URLUser = urlDatabase[req.params.id].userID
    if (user === URLUser) {
      urlDatabase[req.params.id].URL = req.body.update
      //console.log(req.body.update);
      res.redirect("/urls");
    } else {
      res.status(403).send("You may not update that URL, please log in as the original poster.");
    }
});

//Renders the registry page with items inside of template vars
app.get("/register", (req, res) => {
    //This returns the cookie id
  let user_id = req.session["user_id"];
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
let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[randomSixDig] = {
    "id": randomSixDig,
    "email": req.body.email,
    "password": hashedPassword
  };
  //Response with cookie containing the users id
  req.session.user_id = users[randomSixDig].id;
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