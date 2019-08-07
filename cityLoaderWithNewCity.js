
const User = require('./models/user-model');
const axios = require('axios');

async function addPlaces(req, res, newCity){
  console.log('----------------------------------')
  try{
    console.log('hi')
    let geoResult = undefined;
    // if(req.user){
    geoResult = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${newCity}&key=${process.env.GEOCODE}`);
    if(zip){
      geoResult = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${process.env.GEOCODE}`);
    }
    // }else{
      // res.json({message: "User must be signed in"})
      // return;
    // }
    console.log(geoResult.data.results);
    const longitude = geoResult.data.results[0].geometry.lng;
    const latitude = geoResult.data.results[0].geometry.lat;
    let radius = 2500;
    console.log(latitude, longitude, radius)
    if(paramRadius){
      radius = paramRadius;
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
      console.log(restaurants);
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
        'cityPlaces.gym.results': gym.data.results,
        'cityPlaces.gym.nextPage': gym.data.next_page_token
      }
      })
      .then(()=>{
        res.json({message: 'Success'});
        return;
      })
      .catch((err)=>{
        res.json(err);
        return;
      })
  
    }catch(err){
      // return err;
      res.json(err);
    }
}

module.exports = addPlaces;