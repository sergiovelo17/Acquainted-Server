const express = require('express');
const router  = express.Router();
const User = require('../models/user-model');
const Events = require('../models/events');
const axios = require('axios')

router.get('/byCity/:lat/:long/:radius?', async (req, res, next) => {
  console.log('hi')
  const latitude = req.params.lat;
  const longitude = req.params.long;
  let radius = 2500;
  console.log(latitude, longitude, radius)
  if(req.params.radius){
    radius = req.params.radius;
    console.log('radius sent --->',radius)
  }
  try{
    let apiReturn = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${process.env.GOOGLEAPI}`);
    let results = apiReturn.data.results;
    while(apiReturn.data.next_page_token){
      console.log(apiReturn.data.next_page_token)
      nextToken = apiReturn.data.next_page_token;
      apiReturn = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextToken}&key=${process.env.GOOGLEAPI}`);
      results.push(apiReturn.data.results)
    }
    res.json(results);
  }catch(err){
    res.json(err);
  }
});

module.exports = router;
