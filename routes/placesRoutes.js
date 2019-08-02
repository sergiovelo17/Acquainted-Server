const express = require('express');
const router  = express.Router();
const User = require('../models/user-model');
const Events = require('../models/events');
const axios = require('axios')
const Places = require('../models/places')

router.get('/byCity/:radius?', async (req, res, next) => {
  try{
  console.log('hi')
  let geoResult = undefined;
  if(req.user){
  geoResult = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${req.user.acquaintedCity}&key=${process.env.GEOCODE}`);
  }else{
    res.json({message: "User must be signed in"})
    return;
  }
  console.log(geoResult.data.results);
  const longitude = geoResult.data.results[0].geometry.lng;
  const latitude = geoResult.data.results[0].geometry.lat;
  let radius = 2500;
  console.log(latitude, longitude, radius)
  if(req.params.radius){
    radius = req.params.radius;
    console.log('radius sent --->',radius)
  }
    const restaurants = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${process.env.GOOGLEAPI}`);
    const lodging = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=lodging&key=${process.env.GOOGLEAPI}`);
    const banks = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=bank&key=${process.env.GOOGLEAPI}`);
    const doctors = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=doctor&key=${process.env.GOOGLEAPI}`);
    const leisure = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=park&key=${process.env.GOOGLEAPI}`);
    const bars = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=night_club&key=${process.env.GOOGLEAPI}`);
    const government = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=local_government_office&key=${process.env.GOOGLEAPI}`);
    const shopping = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=shopping_mall&key=${process.env.GOOGLEAPI}`);
    const gym = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=gym&key=${process.env.GOOGLEAPI}`);
    
    console.log(shopping.data.results);
    User.findByIdAndUpdate(req.user._id,{$set: {
      'cityPlaces.restaurants.results': restaurants.data.results,
      'cityPlaces.restaurants.nextPage': restaurants.data.next_page_token,
      'cityPlaces.banks.results': banks.data.results,
      'cityPlaces.banks.nextPage': banks.data.next_page_token,
      'cityPlaces.lodging.results': lodging.data.results,
      'cityPlaces.lodging.nextPage': lodging.data.next_page_token,
      'cityPlaces.doctors.results': doctors.data.results,
      'cityPlaces.doctors.nextPage': doctors.data.next_page_token,
      'cityPlaces.leisure.results': leisure.data.results,
      'cityPlaces.leisure.nextPage': leisure.data.next_page_token,
      'cityPlaces.bars.results': bars.data.results,
      'cityPlaces.bars.nextPage': bars.data.next_page_token,
      'cityPlaces.government.results': government.data.results,
      'cityPlaces.governemnt.nextPage': government.data.next_page_token,
      'cityPlaces.shopping.results': shopping.data.results,
      'cityPlaces.shopping.nextPage': shopping.data.next_page_token,
      'cityPlaces.lifestyle.results': lifestyle.data.results,
      'cityPlaces.lifestyle.nextPage': lifestyle.data.next_page_token
    }
    })
    .then(()=>{
      res.json({message: 'Success'});
    })
    .catch((err)=>{
      res.json(err);
    })

  }catch(err){
    res.json(err);
  }
});
router.get('/placeDetails/:id', async (req,res,next)=>{
  try{
    console.log('testing route------->');
    console.log(req.params.id)
    const details = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.params.id}&key=${process.env.GOOGLEAPI}`)
    console.log(details);
    res.json(details.data.result)
  }catch(err){
    res.json({message:"error"})
  }
})
router.get('/getPhoto/:ref',async(req,res,next)=>{
  try{
  let ref = req.params.ref;
  const onePhoto = await axios.get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLEAPI}`)

  console.log('-------------')
  console.log(onePhoto);
  res.json(onePhoto.config.url)
  }catch(err){
    res.json(err);
  }
})

router.post('/addToFavoritePlaces/:id', async (req,res,next)=>{
  try{
    // console.log('<<<<<<<<reached here!!!!')
    if(req.user){
      const details = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.params.id}&key=${process.env.GOOGLEAPI}`)
      console.log("-------=this is where it broke =-------");
      let content = details.data.result;
      console.log(content)
      let photoArr = [];
      for(let i = 0; i < 3; i++){
        let ref = content.photos[i].photo_reference;
        const onePhoto = await axios.get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLEAPI}`)
        photoArr.push(onePhoto.request.res.responseUrl)
      }
      console.log('<<<<<<<<<<<<<<<reached here')
      const newPlace = await new Places({
        owner: req.user,
        placeId: req.params.id,
        lat: content.geometry.location.lat,
        lng: content.geometry.location.lng,
        name: content.name,
        icon: content.icon,
        photos: photoArr,
        price_level: content.price_level,
        rating: content.rating,
        types: content.type,
        phone: content.formatted_phone_number,
        address: content.formatted_address,
        website: content.website,
        hours: content.opening_hours.weekday_text
      });
      // console.log('reached here!!!!')
      const saved = await newPlace.save();
      // console.log("PLACE SAVED---------->")
      const update = await User.findByIdAndUpdate(req.user.id,{$push: {favoritePlaces: newPlace}})
      res.json({message:"add success!"})
    }else{
      res.json({message:"Must be logged in to add place"})
    }
  }catch(err){
    res.json(err)
  }
})

router.get('/nextpage/:token', async(req,res,next)=>{
  try{
    const result = await await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${req.params.token}&key=${process.env.GOOGLEAPI}`);
    console.log(result);
    res.json({results: result.data.results, nextpage: result.data.next_page_token});
  }catch(err){
    res.json(err)
  }
})
module.exports = router;
