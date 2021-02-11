//jshint esversion:6

require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { env } = require("process");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const port = 3000;
const databaseURL = `mongodb://localhost:27017/userDB`;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// Connect to database
mongoose.connect(databaseURL, {useNewUrlParser: true, useUnifiedTopology: true});

// User schema for mongoDB database.
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


// User model for database.
const User = new mongoose.model("User", userSchema);

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

// ************************* POST requests *********************** //
app.post("/register", (req, res) => {
    // Use bcrypt to hash password
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (!err) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
        
            newUser.save((err) => {
                if (!err) {
                    res.render("secrets");
                } else {
                    console.log(err);
                }
            });
        }
    });

    
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if (!err) {
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    // result == true
                    if (result === true) {
                        res.render("secrets");
                    } else {
                        console.log(err);
                    }
                });                    
            }
        } else {
            console.log(err);
        }
    });
});



app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});