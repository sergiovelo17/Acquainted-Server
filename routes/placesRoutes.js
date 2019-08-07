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
router.post('/placeDetails/:id', async (req,res,next)=>{
  try{

    console.log('yo')
    // console.log(req.params.id)
    // console.log('<<<<<<<<reached here!!!!')
      const place = await Places.findOne({placeId: req.params.id})
      const user = await User.findById(req.body.user_id)
      let isFavorited = false;
      if(place){
        console.log('retrieved from databse')
        if(user.favoritePlaces.includes(place._id)){
          isFavorited = true;
        }
        res.json({place: place, isFavorited: isFavorited})
      }else{
      const details = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.params.id}&key=${process.env.GOOGLEAPI}`)
      // console.log("-------=this is where it broke =-------");
      let content = details.data.result;
      // console.log('+++++++++++++++',content)
      let photoArr = [];
      if(content.photos.length >= 3){
        for(let i = 0; i < 3; i++){
          let ref = content.photos[i].photo_reference;
          const onePhoto = await axios.get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLEAPI}`)
          photoArr.push(onePhoto.request.res.responseUrl)
        }
      }else if(content.photos.length == 2){
      for(let i = 0; i < 2; i++){
        let ref = content.photos[i].photo_reference;
        const onePhoto = await axios.get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLEAPI}`)
        photoArr.push(onePhoto.request.res.responseUrl)
      }
    }else if(content.photos.length == 1){
      let ref = content.photos[0].photo_reference;
        const onePhoto = await axios.get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLEAPI}`)
        photoArr.push(onePhoto.request.res.responseUrl)
    }

      const lat = content.geometry.location.lat;
      const lng = content.geometry.location.lng;
      const name = content.name;
      const icon = content.icon;
      const price_level= content.price_level;
      const rating= content.rating;
      const phone = content.formatted_phone_number;
      const address= content.formatted_address;
      const website= content.website;
      const hours= content.opening_hours.weekday_text;
      const reviews= [...content.reviews];
      const newPlace = await new Places({
        owner: req.user,
        placeId: req.params.id,
        lat: lat,
        lng: lng,
        name: name,
        icon: icon,
        photos: [...photoArr],
        price_level: price_level,
        rating: rating,
        phone: phone,
        address: address,
        website: website,
        hours: hours,
        reviews: [...reviews]
      });
      // console.log('reached here!!!!')
      const saved = await newPlace.save();
    
      // console.log("PLACE SAVED---------->")
      res.json({place: newPlace, isFavorited: false})
    }
    
  }catch(err){
    res.json(err)
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
      // console.log(req.body)
      // console.log(req.user)
      if(req.body.favorited){
        const user = await User.findByIdAndUpdate(req.user._id,{$pull: {favoritePlaces: req.params.id}})
      res.json({message: 'successfully removed'})
    }else{
        const user = await User.findByIdAndUpdate(req.user._id,{$push: {favoritePlaces: req.params.id}})
        res.json({message: 'successfully added'})
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
