var citySearchInputEl  = document.querySelector("#searched");
var cityFormEl         = document.querySelector("#search-form");
var weatherContainerEl = document.querySelector("#weather-container");
var cityInputEl        = document.querySelector("#city");
var forecastContainerEl= document.querySelector("#fiveday");
var forecastTitle      = document.querySelector("#weather-forecast");
var cities = [];

/* Build the right OWM query string based on input type:
   - 5-digit zip  → zip=XXXXX,US
   - "City, ST"   → q=City,ST,US
   - anything else→ q=input                              */
function buildQuery(input) {
    var s = input.trim();
    if (/^\d{5}$/.test(s)) {
        return 'zip=' + s + ',US';
    }
    s = s.replace(/\s*,\s*/g, ',');
    if (/^[^,]+,[A-Za-z]{2}$/.test(s)) {
        s = s + ',US';
    }
    return 'q=' + encodeURIComponent(s);
}

var formSumbit = function(event) {
    event.preventDefault();
    var city = cityInputEl.value.trim();
    if (city) {
        getWeather(city);
        fiveDay(city);
        cities.unshift({ city: city });
        cityInputEl.value = "";
    } else {
        alert("Please enter a city, zip code, or city + state.");
    }
    saveSearch();
};

var getWeather = function(input) {
    var apiKey = "844421298d794574c100e3409cee0499";
    var apiURL = "https://api.openweathermap.org/data/2.5/weather?" +
                 buildQuery(input) + "&units=imperial&appid=" + apiKey;
    fetch(apiURL)
        .then(function(response) { return response.json(); })
        .then(function(data) { displayWeather(data); });
};

var displayWeather = function(weather) {
    document.getElementById('current-forecast').style.display = 'block';
    weatherContainerEl.innerHTML = '';

    var date = moment.unix(weather.dt).format("MMM D, YYYY");
    citySearchInputEl.textContent = weather.name + "  (" + date + ")  ";

    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("src",
        "https://openweathermap.org/img/wn/" + weather.weather[0].icon + "@2x.png");
    citySearchInputEl.appendChild(weatherIcon);

    var items = [
        "🌡 Temperature: " + weather.main.temp + " °F",
        "💧 Humidity: "    + weather.main.humidity + " %",
        "💨 Wind Speed: "  + weather.wind.speed + " MPH"
    ];
    items.forEach(function(text) {
        var el = document.createElement("span");
        el.textContent = text;
        el.className = "list-group-item";
        weatherContainerEl.appendChild(el);
    });

    getUv(weather.coord.lat, weather.coord.lon);
};

var saveSearch = function() {
    localStorage.setItem("cities", JSON.stringify(cities));
};

var getUv = function(lat, lon) {
    var apiKey = "844421298d794574c100e3409cee0499";
    fetch("https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey +
          "&lat=" + lat + "&lon=" + lon)
        .then(function(r) { return r.json(); })
        .then(function(data) { displayUv(data); });
};

var displayUv = function(index) {
    var uvEl = document.createElement("div");
    uvEl.className = "list-group-item";

    var label = document.createTextNode("☀️ UV Index: ");
    uvEl.appendChild(label);

    var val = document.createElement("span");
    val.textContent = index.value;
    val.className = index.value <= 2 ? "mild" : index.value <= 8 ? "moderate" : "severe";
    uvEl.appendChild(val);
    weatherContainerEl.appendChild(uvEl);
};

var fiveDay = function(input) {
    var apiKey = "844421298d794574c100e3409cee0499";
    var apiURL = "https://api.openweathermap.org/data/2.5/forecast?" +
                 buildQuery(input) + "&units=imperial&appid=" + apiKey;
    fetch(apiURL)
        .then(function(r) { return r.json(); })
        .then(function(data) { display5Day(data); });
};

var display5Day = function(weather) {
    document.getElementById('five-day-forecast').style.display = 'block';
    forecastContainerEl.textContent = "";
    forecastTitle.textContent = "5-Day Forecast";

    var forecast = weather.list;
    for (var i = 5; i < forecast.length; i += 8) {
        var day = forecast[i];

        var card = document.createElement("div");
        card.className = "card text-light m-1";

        var header = document.createElement("h5");
        header.textContent = moment.unix(day.dt).format("MMM D");
        header.className = "card-header text-center";
        card.appendChild(header);

        var icon = document.createElement("img");
        icon.setAttribute("src",
            "https://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png");
        card.appendChild(icon);

        var temp = document.createElement("div");
        temp.className = "card-body text-center";
        temp.innerHTML = "<strong>" + day.main.temp + " °F</strong><br>" +
                         day.main.humidity + "% humidity";
        card.appendChild(temp);

        forecastContainerEl.appendChild(card);
    }
};

cityFormEl.addEventListener("submit", formSumbit);

/* ── AUTOCOMPLETE ─────────────────────────────────── */
var autocompleteList = document.getElementById('autocomplete-list');
var debounceTimer    = null;
var API_KEY          = "844421298d794574c100e3409cee0499";

cityInputEl.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    var val = cityInputEl.value.trim();

    // skip for zip codes or fewer than 3 chars
    if (val.length < 3 || /^\d+$/.test(val)) {
        hideList();
        return;
    }

    debounceTimer = setTimeout(function () {
        fetch("https://api.openweathermap.org/geo/1.0/direct?q=" +
              encodeURIComponent(val) + "&limit=6&appid=" + API_KEY)
            .then(function (r) { return r.json(); })
            .then(showSuggestions);
    }, 300);
});

function showSuggestions(results) {
    autocompleteList.innerHTML = '';
    if (!results || !results.length) { hideList(); return; }

    results.forEach(function (place) {
        var li = document.createElement('li');
        var label = place.name;
        if (place.state)   label += ', ' + place.state;
        if (place.country) label += ' (' + place.country + ')';
        li.textContent = label;

        li.addEventListener('mousedown', function (e) {
            e.preventDefault(); // prevent input blur before click fires
            var searchVal = place.name + (place.state ? ', ' + place.state : '');
            cityInputEl.value = '';
            hideList();
            getWeather(searchVal);
            fiveDay(searchVal);
            cities.unshift({ city: searchVal });
            saveSearch();
        });

        autocompleteList.appendChild(li);
    });

    autocompleteList.style.display = 'block';
}

function hideList() {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
}

cityInputEl.addEventListener('blur', hideList);
cityInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideList();
});
