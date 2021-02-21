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



// handler  data for functions
function handelLocation(req,res){
    let searchQuery = req.query.city;
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

app.listen(PORT, ()=>{
    console.log('the app is listening on port ' + PORT);
}); 


// constructors
function cityLocation (searchQuery, displayName, lat, lon){
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this. longitude = lon; 
}