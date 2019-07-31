const express = require("express");
const router = express.Router();

const User = require("../models/user-model");
const bcrypt = require("bcryptjs");

const passport = require("passport");

router.post("/signup", (req, res, next) => {
  console.log("calling signup route", req.body);

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const name = req.body.name;
  const city = req.body.city;

  if (!email || !username || !password || !name || !city) {
    res.status(400).json({ message: "Credentials are missing" });
    return;
  }
  // console.log("getting ready to find the user");

  User.findOne({ username: username }, (err, foundUser) => {
    // console.log("this is the user info >>>>> ", foundUser);

    if (err) {
      res.status(500).json({ message: "Username check went bad." });
      return;
    }
    // console.log("did i find a user??????????? ", foundUser);
    if (foundUser) {
      res.status(400).json({ message: "Username taken. Choose another one." });
      return;
    }

    // console.log("breaking before the salt");
    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username,
      password: hashPass,
      name: name,
      email: email,
      acquaintedCity: city
    });
    // console.log("the new user info before the save ======= ", newUser);
    newUser.save(err => {
      if (err) {
        res
          .status(400)
          .json({ message: "Saving user to database went wrong." });
        return;
      }
      req.login(newUser, err => {
        if (err) {
          res.status(500).json({ message: "Login after signup went bad." });
          return;
        }
        res.json({ message: "Congrats, you made an account", newUser });
      });
    });
  });
});


router.post("/login", (req, res, next) => {
  console.log('route working', req.body)
  passport.authenticate("local", (err, theUser, failureDetails) => {
    console.log("authenticated ---- ", theUser)
    if (err) {
      console.log("there was an error $$$$$$$ ", err);
      res
        .status(500)
        .json({ message: "Something went wrong authenticating user" });
      return;
    }
    console.log("did not error, is there a user >>>>>> ", theUser);
    if (!theUser) {
      res.status(401).json(failureDetails);
      return;
    }
    console.log("<<<<<<<<route reached here>>>>>>>>>")
    req.login(theUser, err => {
      console.log("the user was found ;;;;;;;;;;;;;;; ", theUser);
      if (err) {
        res.status(500).json({ message: "Session save went bad." });
        return;
      }
      console.log("=====route reached here=======")
      res.status(200).json(theUser);
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});





module.exports = router;
