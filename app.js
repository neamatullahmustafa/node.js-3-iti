const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const app = express();
app.set("view-engine", "ejs");
app.use(bodyParser.urlencoded());
app.use(cookieParser());
let errorMsg = "";
let successMsg = "";

const mdbClient = new mongodb.MongoClient("mongodb://127.0.0.1:27017");

let dbo = null;
async function dbinit() {
  await mdbClient.connect();
  dbo = mdbClient.db("ITI");
  app.listen(8080);
}
dbinit();

app.get("/login", async function (req, res) {
  errorMsg = "";
  successMsg = "";
  res.render("login.ejs", {
    users: await dbo.collection("users").find().toArray(),
    errorMsg: errorMsg,
    successMsg: successMsg,
  });
});

app.post("/login", async function (req, res) {
  let data = req.body;

  if (data.username != "" && data.password != "") {
    if (data.password.length >= 8) {
      let user = await dbo
        .collection("users")
        .findOne({ username: data.username, password: data.password });
      if (user) {
        const uuid = uuidv4();

        await dbo
          .collection("users")
          .updateOne({ _id: user._id }, { $set: { sid: uuid } });
        res.cookie("sid", uuid);
        successMsg = "Login success";
      } else {
        errorMsg = "User not found";
      }
    } else {
      errorMsg = "Password must be 8 or more characters.";
    }
  } else {
    errorMsg = "Please fill all inputs, All inputs are required.";
  }
  res.render("login.ejs", {
    users: await dbo.collection("users").find().toArray(),
    errorMsg: errorMsg,
    successMsg: successMsg,
  });
});
