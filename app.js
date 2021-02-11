//jshint esversion:6

require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { env } = require("process");
const mongoose = require("mongoose");

// To manage session
const session = require('express-session');
const passport = require("passport");
// passport-local is required just by passport-local-mongoose, so it is not
// necessary to explicitly required here.
const passportLocalMongoose = require("passport-local-mongoose");

const port = 3000;
const databaseURL = `mongodb://localhost:27017/userDB`;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// configure session here.
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

// Initialize passport.
app.use(passport.initialize());
app.use(passport.session());

// Connect to database
mongoose.connect(databaseURL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

// User schema for mongoDB database.
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Hash and salt the database.
userSchema.plugin(passportLocalMongoose);


// User model for database.
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ************************** GET requests ********************** //
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    // Check if user is authenticated.
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// ************************* POST requests *********************** //
app.post("/register", (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            // if authentication is successful, the callback is triggered.
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    })
    
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    })
});



app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});