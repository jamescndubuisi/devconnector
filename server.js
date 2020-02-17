const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const users = require("./routes/api/user");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const passport = require("passport");

const app = express();
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// // DB Config
const db = require("./config/keys").mongoURI;

// //connect to mongodb
mongoose
    .connect(db, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => console.log("Mongo Connected"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("hello world");
});

//passport
app.use(passport.initialize());

//passport config file : uses strategy
require("./config/passport")(passport);

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
const port = process.env.port || 5000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});