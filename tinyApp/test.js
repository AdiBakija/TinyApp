var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var templateVars = {urls: urlDatabase}

for (let key in templateVars) {
  for (let key in urlDatabase) {
    console.log(key, urlDatabase[key]);
  }
}

// for (let key1 in urlDatabase) {
//   console.log(key2, urlDatabase[key]);
// }