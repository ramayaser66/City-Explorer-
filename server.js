'use strict';

// importing packages...
let express = require('express'); 
const cors = require('cors');
let superagent = require('superagent');

let x= 0; 
let y =0; 
// initialization and configuration 

let app = express(); 
app.use(cors());
require('dotenv').config();


const PORT = process.env.PORT; 



// routes - endpoints
app.get('/location', handelLocation);
app.get('/weather', handelWeather); 
// always let the star location be at the end 
app.get('*', handel500); 

function handel500(req, res){
    res.status(500).send({ status :  500, responseText: "Sorry, something went wrong"  }); 
}




// handler  data for location functions
function handelLocation(req, res){
    let searchQuery = req.query.city;
    // console.log(req.query);
    // let locationObject =
     getLocationData(searchQuery, res).then(data =>{
        res.status(200).send(data); 
    }); 
    // res.status(200).send(locationObject); 
  
}


// weather handler function 
function handelWeather(req, res){
  

    let searchQuery = req.query.city;
    getWeatherData(searchQuery, res).then(data =>{
        res.status(200).send(data);
    }); 
    // res.status(200).send(weatherObject);
}



// handle data for functions
function getLocationData(searchQuery){

    const query ={
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: 1,

        format: 'json'
    }; 

    let url = 'https://us1.locationiq.com/v1/search.php'; 
    return superagent.get(url).query(query).then(data => {
        try{

        let longitude = data.body[0].lon;
        let latitude = data.body[0].lat;  
        let displayName = data.body[0].display_name; 
            // create data object
    let responseObject = new cityLocation(searchQuery, displayName, latitude, longitude); 
    x = longitude ;
    y = longitude ; 

    return responseObject; 

        } catch (error){
            res.status(500).send( error);
        }
       
        }) .catch(error =>{
            res.status(500).send('there was an error getting the server' + error); 

    }); 

}









function getWeatherData(searchQuery, res){
    const query2 ={
        key: process.env.WEATHER_API_KEY,
    //    lat: y,
    //    lon: x,
    city: searchQuery,
      
        format: 'json'
    }; 

    let url2 = 'http://api.weatherbit.io/v2.0/forecast/daily';
    return superagent.get(url2).query(query2).then(data => {
        try{

           
      let newArray = []; 
    for (let index = 0; index < data.body.length; index++) {
      let forecast = data.body[index].weather.description;
      let t = data.body[index].datetime;

    //   t = t.replace("-","/");
    //     var date = new Date(t);
    //     let dateStr = date.toString();
    //     var newDate = dateStr.slice(" ",16);
    let newObj = new WeatherData(forecast, t); 
    newArray.push(newObj);  
    }
    
    console.log(newArray);
    return newArray; 
}  catch (error){
    res.status(500).send( error);
}
}).catch(error =>{
    res.status(500).send('there was an error getting the server' + error);
}); 

} 




      



//  location constructor
function cityLocation (searchQuery, displayName, lat, lon){
    this.searchQuery = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this. longitude = lon; 
}



// weather constructor 
function WeatherData (forecast, time){
    this.forecast = forecast; 
    this.time = time; 
}



app.listen(PORT, ()=>{
    console.log('the app is listening on port ' + PORT);
}); 














// function handelLocation(req,res){
//     let searchQuery = req.query.city;
//     let locationObject = getLocationData(searchQuery); 
//     res.status(200).send(locationObject); 

  

// }