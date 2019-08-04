const express = require('express');
const router  = express.Router();
const User = require('../models/user-model');
const Places = require('../models/places');
const Events = require('../models/events')
const axios = require('axios')

/* GET home page */
router.post('/createEvent', async (req,res,next)=>{
  try{
    if(req.user){
      if(req.user.isAcquaintance){
        const place = await Places.findOne({placeId: req.body.placeId})
        const newEvent = await new Events({
          owner: req.user,
          location: place._id,
          description: req.body.description,
          time: req.body.time,
        })
        await newEvent.save()
        const me = await User.findByIdAndUpdate(req.user._id,{$push: {hostedEvents: newEvent}})
        res.json({message: "Event created!"})
      }else{
        res.json({message: "You must be registered as an Acquaintance to use this feature"})
        return;
      }
    }else{
      res.json({message: "Must be logged in to use this feature"})
      return;
    }
  }catch(err){
    res.json(err);
  }
})

router.get('/getEvents/:id', async (req,res,next)=>{
try{
    const user = await User.findById(req.params.id)
    const allEvents = await Events.find().populate('location').populate('owner');
    let eventsForUser = [];
    // if(req.user){
      let geoResult = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${user.acquaintedCity}&key=${process.env.GEOCODE}`);
      console.log(geoResult)
      if(req.body.zip){
        geoResult = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${process.env.GEOCODE}`);
      }

    console.log(geoResult)
    console.log('---------------------------------------')
    console.log(allEvents[0].location)
allEvents.forEach((eachEvent)=>{
  if(eachEvent.location.lat - geoResult.data.results[0].geometry.lat <= 2 &&  eachEvent.location.lat - geoResult.data.results[0].geometry.lat >= -2 && eachEvent.location.lng - geoResult.data.results[0].geometry.lng <= 2 && eachEvent.location.lng - geoResult.data.results[0].geometry.lng >=-2){
    eventsForUser.push(eachEvent)
  }
})
res.json(eventsForUser)
}catch(err){
  res.json(err)
}
})

module.exports = router;
