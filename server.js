'use strict';

// importing packages...
let express = require('express');
const cors = require('cors');
let superagent = require('superagent');
const pg = require('pg');

let x = 0;
let y = 0;
// initialization and configuration 

let app = express();
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT;
const PARKSkey = process.env.PARKS_API_KEY; 
const movieKey = process.env.MOVIE_API_KEY; 
const yelpKey = process.env.YELP_API_KEY;

const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });


// routes - endpoints
app.get('/location', handelLocation);
app.get('/weather', handelWeather);
app.get('/parks', handelparks);
app.get('/movies',handelMovies);
app.get('/yelp',handelYelp);
// always let the star location be at the end 
app.get('*', handel500);

function handel500(req, res) {
    res.status(500).send({ status: 500, responseText: "Sorry, something went wrong" });
}



// handler  data for location functions
function handelLocation(req, res) {
    let searchQuery = req.query.city;
    // console.log(req.query);
    // let locationObject =
    getLocationData(searchQuery, res);
    // res.status(200).send(locationObject); 

}

// weather handler function 
function handelWeather(req, res) {

    let searchQuery = req.query.city;
    let lat = req.query.latitude;
    let lon = req.query.longitude;
    getWeatherData(searchQuery, lat, lon, res);
    // res.status(200).send(weatherObject);
}

function checkLocation(searchQuery){
    let check = `select * from locations where city_name = $1`;
    let s_value = [searchQuery];
    let selectedData = [];
     client.query(check, s_value).then(data => {
        console.log('data returned back from db ', data.rows.length);
        selectedData = data.rows;
    });
    return selectedData;
}

// handle data for functions
function getLocationData(searchQuery, res) {
    let checkExist =  checkLocation(searchQuery);
    if(checkExist.length !== 0 ){
        console.log("in if statment "+checkExist +"  "+ searchQuery);
        let responseObject = new cityLocation(checkExist[0].city_name, checkExist[0].display_name, checkExist[0].latitude, checkExist[0].longitude);
        res.status(200).send(responseObject);
       
    }
    else { 
        const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: 1,

        format: 'json'
    };

    let url = 'https://us1.locationiq.com/v1/search.php';
    superagent.get(url).query(query).then(data => {
        try {

            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;
            // create data object

            // let citiyDb = `INSERT INTO locations(city_name,latitude,longitude) VALUES ($1,$2,$3) RETURNING *`; 
            // let safeValues = [city, longitude,latitude];
            // client.query(citiyDb, safeValues).then(data =>{
            //     console.log('data returned back from db ',data);
            // }); 

            let cityDB = `insert into locations(city_name, display_name, latitude, longitude) values ($1,$2,$3,$4)returning *`;
            let value = [searchQuery, displayName, latitude, longitude];
            client.query(cityDB, value).then(data => {
                console.log('data returned back from db ', data);
            });

            let responseObject = new cityLocation(searchQuery, displayName, latitude, longitude);
            res.status(200).send(responseObject);

        }

        catch (error) {
            res.status(500).send(error);
        }

    }).catch(error => {
        res.status(500).send('there was an error getting the server' + error);

    });
        
    }
   

}








function getWeatherData(searchQuery, lat, lon, res) {
    const query2 = {
        key: process.env.WEATHER_API_KEY,
        lat: lat,
        lon: lon,
        city: searchQuery,
        format: 'json',
        days: 8
    };

    let url2 = 'http://api.weatherbit.io/v2.0/forecast/daily';
    superagent.get(url2).query(query2).then(data => {
        try {
            let weatherObj = JSON.parse(data.text);

            let newArray = [];

            for (let index = 0; index < weatherObj.data.length; index++) {
                let forecast = weatherObj.data[index].weather.description;
                let t = weatherObj.data[index].datetime;

                t = t.replace("-", "/");
                var date = new Date(t);
                let dateStr = date.toString();
                var newDate = dateStr.slice(" ", 16);
                let newObj = new WeatherData(forecast, newDate);
                newArray.push(newObj);
            }

            // console.log(data.text);
            res.status(200).send(newArray);
        } catch (error) {
            res.status(500).send(error);
        }
    }).catch(error => {
        res.status(500).send('there was an error getting the server' + error);
    });

}

 function handelparks(req, res){
     let searchQuery = req.query.search_query; 

    getParks(searchQuery, res); 

}

function handelMovies(req, res){
    let searchQuery = req.query.search_query; 
    getMovies(searchQuery, res); 
}

function getParks(searchQuery, res){
    const query3 = {
        api_key: process.env.PARKS_API_KEY,
       
        q: searchQuery
      
    };
    let url = `https://developer.nps.gov/api/v1/parks`;
    superagent.get(url).query(query3).then(data=>{
        try{
            let newData = data.body.data;
            let parksArray = [];
            for(let i =0; i<newData.length;i++){
                let name = newData[i].fullName;
                let desc = newData[i].description;
                let url = newData[i].url;
                let fee = newData[i].entranceFees[0].cost;
                let address = `" ${newData[i].addresses[0].line1} " "${newData[i].addresses[0].city}" " ${newData[i].addresses[0].stateCode}" "${newData[i].addresses[0].postalCode}" `;
                let parksObject = new CityParks(name,desc,url,fee,address);
                parksArray.push(parksObject);
            }
            res.status(200).send(parksArray);
        }catch(error){
            res.status(500).send("error in fetching data "+ error);
        }
    }).catch(error=>{
        res.status(500).send("error in fetching data "+ error);
    })

}

function  getMovies(searchQuery, res){
    const query4 = {
        api_key: process.env.MOVIE_API_KEY,
       
        query: searchQuery,
        page: 1
      
    };
    let url4 = 'https://api.themoviedb.org/3/search/movie';
    superagent.get(url4).query(query4).then(data => {
        try{

            let movieData = data.body.results;
            console.log(movieData.length); 
            let moviesArray = [];
            for(let i =0; i<movieData.length;i++){
                let title = movieData[i].fullName;
                let overview = movieData[i].description;
                let average_votes = movieData[i].vote_average;
                let total_votes = movieData[i].vote_count;
                let image_url ='https://image.tmdb.org/t/p/w500/'+movieData[i].poster_path;
                let popularity = movieData[i].popularity;
                let released_on = movieData[i].release_date;
                let moviesObject = new Movies(title, overview, average_votes, total_votes, image_url, popularity, released_on);

                moviesArray.push(moviesObject);
            }
            res.status(200).send(moviesArray);

        }catch(error){
            res.status(500).send("error in fetching data "+ error);
        }
    }).catch(error =>{
        res.status(500).send("error in fetching data "+ error);
    })
}




function handelYelp(req, res){
    try{
        let searchQuery = req.query.search_query; 
    
        getYelp(searchQuery, res);
    }catch(error){
        res.status(500).send("error in fetching data "+ error);
    }
    

}
var page = 1;
function getYelp(searchQuery, res){
    const pageNum = 5;
    const start = ((page - 1) * pageNum + 1);
    const query5 = {
        location: searchQuery, 
        limit:pageNum,
        offset:start
      
    };
    page++;
    let url5 = 'https://api.yelp.com/v3/businesses/search'; 
superagent.get(url5).query(query5).set('Authorization', `Bearer ${yelpKey}`).then(data => {
        try{

            let restaurantData = JSON.parse(data.text); 
            let restaurantArray = [];
            for(let i =0; i<restaurantData.businesses.length;i++){
                let name = restaurantData.businesses[i].name;
                let image_url = restaurantData.businesses[i].image_url;
                let price= restaurantData.businesses[i].price;
                let rating = restaurantData.businesses[i].rating;
                let url = restaurantData.businesses[i].url;
               
                let restaurantObject = new Restaurant(name, image_url, price, rating,  url);

                restaurantArray.push(restaurantObject);
            }

            res.status(200).send(restaurantArray);

        }catch(error){
            res.status(500).send("error in fetching data "+ error);
        }
    }).catch(error =>{
        res.status(500).send("error in fetching data "+ error);
    })
}



//  location constructor
function cityLocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;
}


// weather constructor 
function WeatherData(forecast, time) {
    this.forecast = forecast;
    this.time = time;
}

// parks constructor 
function CityParks(name,desc,url,fee,address) {
    this.name = name;
    this.desc = desc;
    this.url = url;
    this.fee = fee;
    this.address = address;

}

// Movies constructor 
 function  Movies(title, overview, average_votes, total_votes, image_url, popularity, released_on){
     this.title = title; 
     this.overview = overview;
     this.average_votes = average_votes;
     this.total_votes = total_votes; 
     this.image_url = image_url;
     this.popularity = popularity;
     this.released_on =released_on; 
 }

 // restaurant constructor 
 function Restaurant(name, image_url, price, rating,  url){
     this.name = name; 
     this.image_url =image_url;
     this.price = price;
     this.rating = rating;
     this.url = url;
 }







client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('the app is listening to port ' + PORT);
    });
}).catch(error => {
    console.log('an error occurred while connecting to database ' + error);
});










