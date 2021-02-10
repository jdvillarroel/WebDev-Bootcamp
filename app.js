//jshint esversion:6

require('dotenv').config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { env } = require("process");
const mongoose = require("mongoose");

// Encryption module for mongoose.
const encrypt = require("mongoose-encryption");

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

// Get the key to encrypt the data.
const secret = process.env.SECRET;

// Add the encryption plugin to the schema.
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

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
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if (!err) {
            res.render("secrets");
        } else {
            console.log(err);
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if (!err) {
            if(foundUser) {
                if (foundUser.password === password)
                    res.render("secrets");
            }
        } else {
            console.log(err);
        }
    });
});



app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});