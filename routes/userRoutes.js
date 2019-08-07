const express = require("express");
const router = express.Router();
const cityLoaderWithNewCity = require("../cityLoaderWithNewCity.js");
const cityLoader = require("../cityLoader.js")
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const Events = require("../models/events")
const axios = require('axios')
const passport = require("passport");

router.post("/signup", async (req, res, next) => {
  console.log("calling signup route", req.body);

  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const name = req.body.name;
  const city = req.body.city;
  const isAcquaintance = req.body.isAcquaintance;

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
      acquaintedCity: city,
      isAcquaintance: isAcquaintance
    });
    // console.log("the new user info before the save ======= ", newUser);
    newUser.save(err => {
      if (err) {
        res
          .status(400)
          .json({ message: "Saving user to database went wrong." });
        return;
      }
      req.login(newUser, async err => {
        if (err) {
          res.status(500).json({ message: "Login after signup went bad." });
          return;
        }else{
         cityLoader(req, res, 2500);
          // res.json({message: "success"})
        }
        // res.json({ message: "Congrats, you made an account", newUser });
      });
    });
  });
});


router.post("/login", (req, res, next) => {
  // console.log('route working', req.body)
  passport.authenticate("local", (err, theUser, failureDetails) => {
    // console.log("authenticated ---- ", theUser)
    if (err) {
      // console.log("there was an error $$$$$$$ ", err);
      res
        .status(500)
        .json({ message: "Something went wrong authenticating user" });
      return;
    }
    // console.log("did not error, is there a user >>>>>> ", theUser);
    if (!theUser) {
      res.status(401).json(failureDetails);
      return;
    }
    // console.log("<<<<<<<<route reached here>>>>>>>>>")
    req.login(theUser, err => {
      // console.log("the user was found ;;;;;;;;;;;;;;; ", theUser);
      if (err) {
        res.status(500).json({ message: "Session save went bad." });
        return;
      }
      // console.log("=====route reached here=======")
      res.status(200).json(theUser);
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

router.post('/attendEvent/:id', async (req,res,next)=>{
  try{
    if(req.user){
    const eventToAttend = await Events.findByIdAndUpdate(req.params.id,{$push: {attendees: req.user}});
    const event = await Events.findById(req.params.id)
    const userUpdate = await User.findByIdAndUpdate(req.user._id,{$push: {upcomingEvents: event}})
    res.json({message: "Successfully added event to your list"})
    }else{
      res.json({message:"You must be logged in to use this feature"})
    }
  }catch(err){
    res.json(err);
  }
})

router.post('/updateLocation', async (req,res,next)=>{
  try{
    if(req.user){
      cityLoader(req, res, req.body.radius, req.body.zip);
    }else{
      res.json({message: "User must be signed in"})
    }
  }catch(err){
    res.json(err)
  }
})

router.get('/currentUser', async (req,res,next)=>{
  try{
    const user = await User.findById(req.user._id).populate('favoritePlaces').populate('upcomingEvents').populate('pastEvents').populate({ path: 'upcomingEvents', populate: { path: 'location' } });;
    res.json(user);
  }catch(err){
    res.json(null);
  }
})

router.post('/editProfile', async (req,res,next)=>{
  try{
    const user = await User.findById(req.user._id) 
    const userToUpdate = await User.findByIdAndUpdate(req.user._id,{
      name: req.body.name,
      username: req.user.username,
      email: req.user.email,
      acquaintedCity: req.body.city,
      isAcquaintance: req.body.isAcquaintance
    })
    console.log(userToUpdate);
    const updatedUser = await User.findById(req.user._id)
    if(user.acquaintedCity !== req.body.city){
      console.log('city changed')
       cityLoaderWithNewCity(req, res, req.body.city);
    }
    console.log(updatedUser)
    res.json({message: 'successfully edited user', updated: updatedUser})
  }catch(err){
    res.json(err)
  }
})

router.post('/latlng', async (req,res,next)=>{
try{
const geoResult = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${req.user.acquaintedCity}&key=${process.env.GEOCODE}`);
console.log(geoResult)
const longitude = geoResult.data.results[0].geometry.lng;
const latitude = geoResult.data.results[0].geometry.lat;
res.json({lat: latitude, lng: longitude})
}catch(err){
  res.json(err)
}
})






module.exports = router;
