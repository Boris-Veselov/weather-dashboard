// need to save info to get more info from api by creating variables



// function getCity (city) {
//     fetch("https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=e91aacea907bbe8f783590aae55793e7")
//         .then(res => res.json())
//         .then(data => {
//             // this gets lon & lan
//             console.log(data)
            
//         })
// }

// getCity()


// list of variables
var citySearchInputEl = document.querySelector("#searched");
var cityFormEl=document.querySelector("#search-form");
var pastSearchButtonEl = document.querySelector("#search-buttons");
var weatherContainerEl=document.querySelector("#weather-container");
var cityInputEl=document.querySelector("#city");
var forecastContainerEl = document.querySelector("#fiveday-container");
var forecastTitle = document.querySelector("#forecast");
var cities = [];

// submitting form
var formSumbitHandler = function(event){
    event.preventDefault();
    var city = cityInputEl.value.trim();
    if(city){
        getWeather(city);
        fiveDay(city);
        cities.unshift({city});
        cityInputEl.value = "";
    } else{
        alert("enter a city");
    }
    saveSearch();
}

// fetch api
var getWeather = function(city){
    var apiKey = "844421298d794574c100e3409cee0499"
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            displayWeather(data, city);
        });
    });
};

// function for weather elements
var displayWeather = function(weather, searchCity){
  
   var currentDate = document.createElement("span")
   currentDate.textContent=" (" + moment(weather.dt.value).format("MMM D, YYYY") + ") ";
   citySearchInputEl.appendChild(currentDate);

   var weatherIcon = document.createElement("img")
   weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`);
   citySearchInputEl.appendChild(weatherIcon);

   var temperatureEl = document.createElement("span");
   temperatureEl.textContent = "Temperature: " + weather.main.temp + " °F";
   temperatureEl.classList = "list-group-item"
  
   var humidityEl = document.createElement("span");
   humidityEl.textContent = "Humidity: " + weather.main.humidity + " %";
   humidityEl.classList = "list-group-item"

   var windSpeedEl = document.createElement("span");
   windSpeedEl.textContent = "Wind Speed: " + weather.wind.speed + " MPH";
   windSpeedEl.classList = "list-group-item"

   //append to containers
   weatherContainerEl.appendChild(temperatureEl);
    weatherContainerEl.appendChild(humidityEl);
    weatherContainerEl.appendChild(windSpeedEl);

   var lat = weather.coord.lat;
   var lon = weather.coord.lon;
   getUvIndex(lat,lon)
}

// local storage function
var saveSearch = function(){
    localStorage.setItem("cities", JSON.stringify(cities));
};

// fetch api
var getUvIndex = function(lat,lon){
    var apiKey = "844421298d794574c100e3409cee0499"
    var apiURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`
    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            displayUvIndex(data)
           
        });
    });
}
 
var displayUvIndex = function(index){
    var uvIndexEl = document.createElement("div");
    uvIndexEl.textContent = "UV Index: "
    uvIndexEl.classList = "list-group-item"

    uvIndexValue = document.createElement("span")
    uvIndexValue.textContent = index.value

    if(index.value <=2){
        uvIndexValue.classList = "favorable"
    }else if(index.value >2 && index.value<=8){
        uvIndexValue.classList = "moderate "
    }
    else if(index.value >8){
        uvIndexValue.classList = "severe"
    };


    // append to current weather
    uvIndexEl.appendChild(uvIndexValue);
    weatherContainerEl.appendChild(uvIndexEl);
}

// fetch api
var fiveDay = function(city){
    var apiKey = "844421298d794574c100e3409cee0499"
    var apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
           display5Day(data);
        });
    });
};

var display5Day = function(weather){
    forecastContainerEl.textContent = ""
    forecastTitle.textContent = "5-Day Forecast:";

    var forecast = weather.list;
        for(var i=5; i < forecast.length; i=i+8){
       var dailyForecast = forecast[i];
        
       
       var forecastEl=document.createElement("div");
       forecastEl.classList = "card bg-primary text-light m-2";

       //console.log(dailyForecast)

       //create date element
       var forecastDate = document.createElement("h5")
       forecastDate.textContent= moment.unix(dailyForecast.dt).format("MMM D, YYYY");
       forecastDate.classList = "card-header text-center"
       forecastEl.appendChild(forecastDate);

       
       //create an image element
       var weatherIcon = document.createElement("img")
       weatherIcon.classList = "card-body text-center";
       weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}@2x.png`);  

       //append to forecast card
       forecastEl.appendChild(weatherIcon);
       
       //create temperature span
       var forecastTempEl=document.createElement("span");
       forecastTempEl.classList = "card-body text-center";
       forecastTempEl.textContent = dailyForecast.main.temp + " °F";

        //append to forecast card
        forecastEl.appendChild(forecastTempEl);

       var forecastHumEl=document.createElement("span");
       forecastHumEl.classList = "card-body text-center";
       forecastHumEl.textContent = dailyForecast.main.humidity + "  %";

       //append to forecast card
       forecastEl.appendChild(forecastHumEl);

        // console.log(forecastEl);
       //append to five day container
        forecastContainerEl.appendChild(forecastEl);
    }

}


cityFormEl.addEventListener("submit", formSumbitHandler);

