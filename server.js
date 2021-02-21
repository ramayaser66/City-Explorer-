'use strict';

// importing packages...
let express = require('express'); 
const cors = require('cors');


// initialization and configuration 

let app = express(); 
app.use(cors());
require('dotenv').config();


const PORT = process.env.PORT; 



// routes - endpoints
app.get('/location', handelLocation);
app.get('/weather', handelWeather); 



// handler  data for location functions
function handelLocation(req,res){
    let searchQuery = req.query.city;
    // console.log(req);
    let locationObject = getLocationData(searchQuery); 
    res.status(200).send(locationObject); 

  

}



// handle data for functions
function getLocationData(searchQuery){
    // get the data array from the json
    let locationData = require('./Data/location.json');
    // get values from object
    let longitude = locationData[0].lon;
    let latitude = locationData[0].lat;
    let displayName = locationData[0].display_name;
    // create data object
    let responseObject = new cityLocation(searchQuery, displayName, latitude, longitude); 
    return responseObject;

}


// weather handler function 
function handelWeather(req, res){
    // let searchQuery = req.query.city;
    let weatherObject = getWeatherData();
    res.status(200).send(weatherObject);



}



function getWeatherData(){
    let newArray = []; 
    let weatherData = require('./Data/weather.json');
    for (let index = 0; index < weatherData.data.length; index++) {
      let forecast = weatherData.data[index].weather.description;
      let t = weatherData.data[index].datetime;




      t = t.replace("-","/");
        var date = new Date(t);
        let dateStr = date.toString();
        var newDate = dateStr.slice(" ",16);

    
      

    let newObj = new WeatherData(forecast, newDate); 
    newArray.push(newObj); 



        
    }
    return newArray; 
}

app.listen(PORT, ()=>{
    console.log('the app is listening on port ' + PORT);
}); 


//  location constructor
function cityLocation (searchQuery, displayName, lat, lon){
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this. longitude = lon; 
}



// weather constructor 
function WeatherData (forecast, time){
    this.forecast = forecast; 
    this.time = time; 
}

















// function handelLocation(req,res){
//     let searchQuery = req.query.city;
//     let locationObject = getLocationData(searchQuery); 
//     res.status(200).send(locationObject); 

  

// }