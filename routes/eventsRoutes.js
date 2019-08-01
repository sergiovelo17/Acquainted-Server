const express = require('express');
const router  = express.Router();
const User = require('../models/user-model');
const Places = require('../models/places');
const Events = require('../models/events')
/* GET home page */
router.post('/createEvent', async (req,res,next)=>{
  try{
    if(req.user){
      if(req.user.isAcquaintance){
        const place = await Places.findOne({name: req.body.placeName})
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

module.exports = router;
