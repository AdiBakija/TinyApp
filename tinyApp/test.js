function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  console.log(r);
}

generateRandomString();